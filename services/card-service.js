let User = require('../models/user-model')
let Card = require('../models/card-model')
let ServerError = require('../exceptions/server-error')
let HandlersService = require('./handlers-service')

class CardService {
    async findCard(number) {
        let existNumber = await Card.findOne({uniqueCardNumber: number})

        return existNumber
    }
    
    async create(jwt, date, tel) {
        let user = await User.findOne({_id: jwt})

        if(!user) {
            throw ServerError.Unauthorized()
        }

        if(user.lastName === '' || user.patronymic === '') {
            throw ServerError.BadRequest('У вас незаполненны данные о вашей фамилии и отчестве')
        }

        let checkTel = await Card.findOne({tel: tel})

        if(checkTel) {
            throw ServerError.BadRequest('Карта с таким привязанным номером телефона уже существует')
        } 
        
        if(user.cards.length >= 5) {
            throw ServerError.BadRequest('Нельзя иметь больше 5-ти карт')
        }
        
        if(user.carrierBirth == "") {
            user.carrierBirth = date
            await user.save()
        } else if(user.carrierBirth != "" && date != user.carrierBirth) {
            throw ServerError.BadRequest('Вы указали дату рождения, отличную от той, которую вы указывали при создании первой карты')
        }

        let card = await Card.create({
            balance: 300,
            holdersName: user.firstName,
            holdersSurname: user.lastName,
            holdersPatronymic: user.patronymic,
            expenses: 0,
            expirationDate: new Date(Date.now() + 365 * 24*3600*1000),
            CVV: HandlersService.createRandomCVV(),
            uniqueCardNumber: await HandlersService.createCardNumber(),
            transactionsTo: [],
            transactionsFrom: [],
            tel: tel,
        })

        user.cards.push(card._id)
        return await user.save()
    }

    async get(jwt, cardNumber, compressed) {
        let user = await User.findOne({_id: jwt})

        if(!user) {
            throw ServerError.Unauthorized()
        }

        let cardEx = await Card.findOne({uniqueCardNumber: cardNumber}).select('balance holdersName holdersSurname holdersPatronymic expirationDate uniqueCardNumber transactions').populate({
            path: 'transactions',
            options: {
                sort: {createdAt: -1}
            },
            select: 'type money createdAt uniqueNumber recieverCard senderCard',
            populate: {
                path: 'reciever',
                select: 'firstName'
            }
        })

        if(!cardEx) {
            throw ServerError.notFound()
        }

        let card
        if(compressed == 'true') {
            // let length = cardEx.transactions.length
            card = cardEx
            // card.transactions.splice(3, length - 3) либо ниже
            card.transactions.splice(3)
        } else if(compressed == 'false') {
            card = cardEx
        }

        if(user.cards.indexOf(card._id) < 0) {
            return res.status(409).send('Запрашиваемая карта вам не принадлежит')
        }

        if(!card) {
            return res.status(409).send('Карта не найдена')
        }

        return card
    }

    async delete(jwt, cardId) {
        let user = await User.findOne({_id: jwt})

        if(!user) {
            throw ServerError.Unauthorized()
        }

        let card = await Card.findOne({uniqueCardNumber: cardId})

        if(!card) {
            throw ServerError.notFound()
        } else if (card.balance > 0) {
            throw ServerError.BadRequest('Баланс карты не равен нулю')
        }

        let index = user.cards.indexOf(card._id)
        if(index != -1) {
            user.cards.splice(index, 1)
        } else {
            throw ServerError.BadRequest('Карта вам не принадлежит')
        }

        await card.deleteOne()
        
        return await user.save()
    }
}

module.exports = new CardService()