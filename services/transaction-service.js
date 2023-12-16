const TokenService = require("./token-service")
let Transaction = require('../models/transaction-model')
const ServerError = require("../exceptions/server-error")
let User = require('../models/user-model')
const CardService = require('./card-service');
const HandlersService = require("./handlers-service")
const MailService = require("./mail-service")
const UserService = require("./user-service")
let bcrypt = require('bcrypt')
let dayjs = require('dayjs')

class TransactionService {
    async crypt(money, toCard, unique, redirectTo, routeTopUp) {
        let payload = TokenService.signPayload(money, toCard, unique, redirectTo, routeTopUp)

        return payload
    }

    async oplata(path) {
        let transaction = await Transaction.findOne({pathNum: path}).select('type money createdAt recieverCard')

        if(!transaction) {
            throw ServerError.BadRequest('Транзакции не существует')
        }

        return transaction
    }
    
    async findTransactionViaPath(result) {
        let existNumber = await Transaction.findOne({pathNum: result})
        
        return existNumber
    }

    async findTransactionViaNumber(number) {
        let existNumber = await Transaction.findOne({uniqueNumber: number})

        return existNumber
    }

    async create(jwt, money, fromCard, toCard) {
        let user = await User.findOne({_id: jwt})

        if(!user) {
            throw ServerError.Unauthorized()
        }

        let cardFrom = await CardService.findCard(fromCard)
        let cardTo = await CardService.findCard(toCard)

        if(!cardFrom || !cardTo) {
            throw ServerError.BadRequest('Карта не найдена')
        } else if(!user.cards.includes(cardFrom._id)) {
            throw ServerError.BadRequest('Карта, с которой вы переводите деньги, вам не принадлежит')
        } else if(String(cardFrom._id) === String(cardTo._id)) {
            throw ServerError.BadRequest('Нельзя перевести деньги на свою же карту')
        } else if(money > cardFrom.balance) {
            throw ServerError.BadRequest('Недостаточно средств на балансе карты')
        }

        let checkerPerson = await this.checkerPerson(cardFrom._id, cardTo._id)

        let saverHandler = await this.saveTransactionOperations(user.mail, 'waiting-for-shifting', money, checkerPerson, cardFrom, cardTo, null)
            
        return saverHandler
    }

    async saveTransactionOperations(mail, type, money, checkerPerson, cardFrom, cardTo, payload) {
        let number = HandlersService.codeGenerate()
        await MailService.sendConfirmationCode(mail, number)

        let salt = await bcrypt.genSalt(10)
        let codeNum = await bcrypt.hash(String(number), salt)

        let path = await HandlersService.createNumber()

        await Transaction.create({
            type: type,
            money: money,
            uniqueNumber: await HandlersService.createTransactionNumber(),
            sender: checkerPerson.sender._id,
            senderCard: Number(cardFrom.uniqueCardNumber),
            reciever: checkerPerson.reciever._id,
            recieverCard: Number(cardTo.uniqueCardNumber),
            pathNum: path,
            codeNum: codeNum,
            payloadCode: payload != null ? payload.replace(/\./g, '2EE') : null
        })
            
        return path
    }

    async paymentCreate(payload, cvv, cardNum, dateExp) {
        let data = TokenService.paymentVerify(payload)
        if (!data.cardLoad || !data.money) {
            throw ServerError.Conflict()
        }

        let cardSender = await CardService.findCard(cardNum)
        if(!cardSender) {
            throw ServerError.BadRequest('Карта не найдена или данные не верны')
        }
        
        let cardReciever = await CardService.findCard(data.cardLoad)

        if(cardSender.CVV != cvv || dayjs(cardSender.expirationDate).format('YYYY-MM') != dateExp) {
            throw ServerError.BadRequest('Данные не верны')
        } else if(String(cardSender._id) === String(cardReciever._id)) {
            throw ServerError.BadRequest('Нельзя перевести деньги на свою же карту')
        } else if(data.money > cardSender.balance) {
            throw ServerError.BadRequest('Недостаточно средств на балансе вашей карты')
        }

        let sender = await UserService.findUserViaCard(cardSender._id)
        let reciever = await UserService.findUserViaCard(cardReciever._id)
        
        let saverHandler = await this.saveTransactionOperations(sender.mail, 'waiting-for-payment', data.money, {sender, reciever}, cardSender, cardReciever, payload)
        
        return saverHandler
    }

    async accept(code, path) {
        let transaction = await this.findTransactionViaPath(path)

        if(!transaction) {
            throw ServerError.BadRequest('Транзакции не существует')
        }

        let difference = HandlersService.getDifference(transaction.createdAt)
        if(difference > 300) {
            await transaction.deleteOne()
            throw ServerError.BadRequest('Операция больше недействительна, так как время на ввод кода закончилось')
        }

        let checkCode = await bcrypt.compare(code, transaction.codeNum)
        if(!checkCode) {
            throw ServerError.BadRequest('Код подтверждения не подходит')
        }

        let senderCardNum = await CardService.findCard(transaction.senderCard)
        let recieverCardNum = await CardService.findCard(transaction.recieverCard)
        if(!senderCardNum || !recieverCardNum) {
            throw ServerError.BadRequest('Пользователь не найден')
        }

        let checkerPerson = await this.checkerPerson(senderCardNum._id, recieverCardNum._id)
        senderCardNum.balance = Number(senderCardNum.balance) - Number(transaction.money)
        senderCardNum.expenses = Number(senderCardNum.expenses) + Number(transaction.money)
        recieverCardNum.balance = Number(recieverCardNum.balance) + Number(transaction.money)
        senderCardNum.transactions.push(transaction._id)
        recieverCardNum.transactions.push(transaction._id)

        await senderCardNum.save()
        await recieverCardNum.save()

        checkerPerson.sender.expensesAll = Number(checkerPerson.sender.expensesAll) + Number(transaction.money)
        checkerPerson.reciever.depositsAll = Number(checkerPerson.reciever.depositsAll) + Number(transaction.money)

        await checkerPerson.sender.save()
        await checkerPerson.reciever.save()

        transaction.type = 'shifting'
        transaction.pathNum = null
        transaction.codeNum = null
        if(transaction.payloadCode != null) {
            let data = TokenService.payloadVerify(transaction.payloadCode)
            transaction.payloadCode = null
            await transaction.save()

            return data
        }
    }

    async checkerPerson(senderId, recieverId) {
        let sender = await UserService.findUserViaCard(senderId)
        let reciever = await UserService.findUserViaCard(recieverId)

        if(!reciever) {
            throw ServerError.BadRequest('Получатель не найден')
        } else if (!sender) {
            throw ServerError.BadRequest('Вы не зарегистрированы')
        }

        return {
            sender, reciever
        }
    }
}

module.exports = new TransactionService()