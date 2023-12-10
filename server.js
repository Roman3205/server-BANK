let express = require('express')
let app = express()
let dotenv = require('dotenv')
let path = require('path')
// let bcrypt = require('bcrypt')
// let jwt = require('jsonwebtoken')
let cookieParser = require('cookie-parser')
// let openAI = require("openai")
// let dayjs = require('dayjs')
// let nodemailer = require('nodemailer')
let cors = require('cors')
let mongoose = require('mongoose')
let corsOptions = require('./config/cors-config')
let router = require('./router/router')
let errorMiddleware = require('./middlewares/error-middleware')

dotenv.config({path: path.resolve(__dirname, './.env')})

// let transporter = nodemailer.createTransport({
//     host: 'smtp.yandex.ru',
//     port: 465,
//     secure: true,
//     // service: 'gmail',
//     auth: {
//         user: process.env.YANDEX_MAIL,
//         pass: process.env.YANDEX_PASSWORD
//     }
// })

// let openai = new openAI({
//     apiKey: process.env.OPENAI_KEY
// })
app
    .use(express.json())
    .use(cookieParser())
    .use(cors(corsOptions))
    .use('/server', router)
    .use(errorMiddleware)

mongoose.set('strictQuery', true)

let uri = process.env.MONGODB_HOST
let backPort = process.env.VITE_BACKEND_PORT
let backHost = process.env.BACKEND_HOST

let start = async () => {
    try {
        mongoose.connect(uri)
        app.listen(backPort, () => {
            console.log(backHost);
        })
    } catch (error) {
        console.log(error);
    }
}

start()


// сделать валидацию ВСЕХ полей, длина обрезка и тд. Отработать ошибки при создании новых доков
// select передаваемые данные запросов

// let randomCardNumber = () => {
//     let min = 2023300050004500
//     let max = 2023888899994444

//     return Math.floor(Math.random() * (max-min) + min)
// }

// let createCardNumber = async () => {
//     while(true) {
//         let number = randomCardNumber()
//         let existNumber = await Card.findOne({uniqueCardNumber: number})

//         if(!existNumber) {
//             return number
//         }
//     }
// }

// let createNumber = async () => {
//     while(true) {
//         let result = ''
//         let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

//         for(i = 0; i < 50; i++) {
//             let randomNumber = Math.floor(Math.random() * characters.length)
//             result += characters.charAt(randomNumber)
//         }

//         let existNumber = await Transaction.findOne({pathNum: result})

//         if(!existNumber) {
//             return result
//         }
//     }
// }

// let createRandomCVV = () => {
//     let min = 111
//     let max = 999
    
//     return Math.floor(Math.random() * (max - min) + min)
// }

// let randomTransactionNumber = () => {
//     let min = 2738193120234325
//     let max = 7479464824726374

//     return Math.floor(Math.random() * (max-min) + min)
// }

// let createTransactionNumber = async () => {
//     while(true) {
//         let number = randomTransactionNumber()
//         let existNumber = await Transaction.findOne({uniqueNumber: number})

//         if(!existNumber) {
//             return number
//         }
//     }
// }

// app.post('/user/fill', VerifyUser, async (req,res) => {
//     let {lastName, patronymic} = req.body
//     if (!lastName || !patronymic) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных данных ошибок')
//     }

//     let user = await User.findOne({_id: req.userJWT})

//     if(!user) {
//         return res.status(401).send('Вы не авторизованы')
//     }

//     user.lastName = lastName
//     user.patronymic = patronymic

//     await user.save()

//     res.sendStatus(200)
// })

// app.post('/card/create', VerifyUser, async (req,res) => {
//     let {name, surname, patronymic, date, tel} = req.body
//     if (!name || !surname || !patronymic || !date || !tel) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных данных ошибок')
//     }

//     let user = await User.findOne({_id: req.userJWT})

//     if(!user) {
//         return res.status(401).send('Вы не авторизованы')
//     }

//     let checkTel = await Card.findOne({tel: tel})

//     if(checkTel) {
//         return res.status(409).send('Карта с таким привязанным номером телефона уже существует')
//     }

//     if(user.cards.length >= 5) {
//         return res.status(409).send('Нельзя иметь больше 5-ти карт')
//     }

//     if(date != user.carrierBirth) {
//         return res.status(409).send('Вы указали дату рождения, отличную от той, которую вы указывали при создании первой карты')
//     }

//     let card = new Card({
//         balance: 0,
//         holdersName: name,
//         holdersSurname: surname,
//         holdersPatronymic: patronymic,
//         expenses: 0,
//         expirationDate: new Date(Date.now() + 365 * 24*3600*1000),
//         CVV: createRandomCVV(),
//         uniqueCardNumber: await createCardNumber(),
//         transactionsTo: [],
//         transactionsFrom: [],
//         tel: tel,
//     })

//     await card.save()

//     user.carrierBirth = date

//     user.cards.push(card._id)

//     await user.save()

//     res.sendStatus(200)
// })

// app.get('/card/get', VerifyUser, async (req,res) => {
//     let {cardNumber, compressed} = req.query
//     if (!cardNumber || !compressed) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных данных ошибок')
//     }

//     let user = await User.findOne({_id: req.userJWT})

//     if(!user) {
//         return res.status(401).send('Вы не авторизованы')
//     }

//     let cardEx = await Card.findOne({uniqueCardNumber: cardNumber}).select('balance holdersName holdersSurname holdersPatronymic expirationDate uniqueCardNumber transactions').populate({
//         path: 'transactions',
//         options: {
//             sort: {createdAt: -1}
//         },
//         select: 'type money createdAt uniqueNumber recieverCard senderCard',
//         populate: {
//             path: 'reciever',
//             select: 'firstName'
//         }
//     })

//     let card
//     if(compressed == 'true') {
//         // let length = cardEx.transactions.length
//         card = cardEx
//         // card.transactions.splice(3, length - 3) либо ниже
//         card.transactions.splice(3)
//     } else if(compressed == 'false') {
//         card = cardEx
//     }

//     if(user.cards.indexOf(card._id) < 0) {
//         return res.status(409).send('Запрашиваемая карта вам не принадлежит')
//     }

//     if(!card) {
//         return res.status(409).send('Карта не найдена')
//     }

//     res.status(200).send(card)
// })

// app.delete('/card/delete', VerifyUser, async (req,res) => {
//     let {cardId} = req.query
//     if (!cardId) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных данных ошибок')
//     }

//     let user = await User.findOne({_id: req.userJWT})

//     if(!user) {
//         return res.status(401).send('Вы не авторизованы')
//     }

//     // let card = await Card.findOneAndDelete({_id: cardId})
//     let card = await Card.findOne({uniqueCardNumber: cardId})

//     if(!card) {
//         return res.status(409).send('Карта не найдена')
//     } else if (card.balance > 0) {
//         return res.status(409).send('Баланс карты не равен нулю')
//     }

//     await card.deleteOne()

//     let index = user.cards.indexOf(card._id)

//     if(index != -1) {
//         user.cards.splice(index, 1)
//         await user.save()
//     } else {
//         return
//     }

//     res.sendStatus(200)
// })

// app.post('/transaction/crypt', async (req,res) => {
//     let {money, toCard, unique, redirectTo, routeTopUp, userId} = req.body
//     if (!money || !toCard) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных ошибок')
//     }

//     let payload = jwt.sign({money: money, card: toCard, unique: unique, redirectTo: redirectTo, routeTopUp: routeTopUp, userId: userId}, process.env.CRYPTION_PAYMENT, {algorithm: 'HS256'})
 
//     res.status(200).send({path: payload.replace(/\./g, '2EE'), urlBank: `${process.env.URL_SELF}`})
// })

// app.post('/payment/create', async (req,res) => {
//     let {payload, cvv, cardNum, dateExp} = req.body
//     if (!payload || !cvv || !cardNum || !dateExp) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных ошибок')
//     }

//     jwt.verify(payload.replace(/2EE/g, '.'), process.env.CRYPTION_PAYMENT, (error, decoded) => {
//         if(error) {
//             return res.status(409).send('Ошибка передачи данных на сервер')
//         }
        
//         req.money = decoded.money
//         req.cardLoad = decoded.card
//     })
//     if (!req.cardLoad || !req.money) {
//         return res.status(409).send('Ошибка передачи данных на сервер')
//     }

//     let cardSender = await Card.findOne({uniqueCardNumber: cardNum})
//     if(!cardSender) {
//         return res.status(409).send('Карта не найдена или данные не верны')
//     }

//     let cardReciever = await Card.findOne({uniqueCardNumber: req.cardLoad})

//     if(cardSender.CVV != cvv || dayjs(cardSender.expirationDate).format('YYYY-MM') != dateExp) {
//         return res.status(409).send('Данные не верны')
//     } else if(String(cardSender._id) === String(cardReciever._id)) {
//         return res.status(409).send('Нельзя перевести деньги на свою же карту')
//     } else if(req.money > cardSender.balance) {
//         return res.status(409).send('Недостаточно средств на балансе вашей карты')
//     }

//     let number = Math.floor(Math.random() * (999999-111111) + 111111)

//     let userCard = await User.findOne({cards: {$elemMatch: {$eq: {_id: cardSender._id}}}})
//     let mailOptions = {
//         from: process.env.YANDEX_MAIL,
//         to: `${userCard.mail}`,
//         subject: 'Микробанк',
//         html: `
//             <p>С вашего аккаунта будет совершена операция по оплате.</p>
//             <p>Если это сделали не вы, пожалуйста, проигнорируйте данное письмо.</p>
//             <span>Код подтверждения:</span> <strong><h3>${number}</h3></strong>
//         `
//     }

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return console.log('Произошла ошибка с отправкой кода подтверждения: ' + error);
//         }
//     })

//     let salt = await bcrypt.genSalt(10)
//     let codeNum = await bcrypt.hash(String(number), salt)
//     let recieverCard = await User.findOne({cards: {$elemMatch: {$eq: {_id: String(cardReciever._id)}}}})

//     if(!recieverCard) {
//         return res.status(409).send('Получатель не найден')
//     }

//     let path = await createNumber()

//     let transaction = new Transaction({
//         type: 'waiting-for-payment',
//         money: req.money,
//         uniqueNumber: await createTransactionNumber(),
//         sender: userCard._id,
//         senderCard: Number(cardSender.uniqueCardNumber),
//         reciever: recieverCard._id,
//         recieverCard: Number(cardReciever.uniqueCardNumber),
//         pathNum: path,
//         codeNum: codeNum,
//         payloadCode: payload.replace(/\./g, '2EE')
//     })
    
//     await transaction.save()

//     res
//         .status(200)
//         .send({oplata: path})
// })

// app.post('/transaction/create', VerifyUser, async (req,res) => {
//     let {money, fromCard, toCard} = req.body
//     if (!money || !fromCard || !toCard) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных ошибок')
//     }

//     let user = await User.findOne({_id: req.userJWT})

//     if(!user) {
//         return res.status(401).send('Вы не авторизованы')
//     }    

//     let cardFrom = await Card.findOne({uniqueCardNumber: fromCard})
//     let cardTo = await Card.findOne({uniqueCardNumber: toCard})

//     if(!cardFrom || !cardTo) {
//         return res.status(409).send('Карта получателя не найдена')
//     } else if(!user.cards.includes(cardFrom._id)) {
//         return res.status(409).send('Карта, с которой вы переводите деньги, вам не принадлежит')
//     } else if(String(cardFrom._id) === String(cardTo._id)) {
//         return res.status(409).send('Нельзя перевести деньги на свою же карту')
//     } else if(money > cardFrom.balance) {
//         return res.status(409).send('Недостаточно средств на балансе карты')
//     }

//     let number = Math.floor(Math.random() * (999999-111111) + 111111)

//     let mailOptions = {
//         from: process.env.YANDEX_MAIL,
//         to: `${user.mail}`,
//         subject: 'МикроБанк',
//         // text: `С вашего аккаунт будет совершена операция по переводу\n Если это сделали не вы - не переходите по ссылке \n ${number}`
//         html: `
//             <p>С вашего аккаунта будет совершена операция по переводу.</p>
//             <p>Если это сделали не вы, пожалуйста, проигнорируйте данное письмо.</p>
//             <span>Код подтверждения:</span> <strong><h3>${number}</h3></strong>
//         `
//     }

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return res.status(409).send('Произошла ошибка с отправкой кода подтверждения: ' + error);
//         }
//     })

//     let salt = await bcrypt.genSalt(10)
//     let codeNum = await bcrypt.hash(String(number), salt)
    
//     let sender = await User.findOne({cards: {$elemMatch: {$eq: String(cardFrom._id)}}})
//     let reciever = await User.findOne({cards: {$elemMatch: {$eq: String(cardTo._id)}}})

//     if(!reciever || !sender) {
//         return res.status(409).send('Получатель не найден')
//     }

//     let path = await createNumber()

//     let transaction = new Transaction({
//         type: 'waiting-for-shifting',
//         money: money,
//         uniqueNumber: await createTransactionNumber(),
//         sender: sender._id,
//         senderCard: Number(cardFrom.uniqueCardNumber),
//         reciever: reciever._id,
//         recieverCard: Number(cardTo.uniqueCardNumber),
//         pathNum: path,
//         codeNum: codeNum
//     })

//     await transaction.save()

//     res
//         .status(200)
//         .send({oplata: path})
// })

// app.get('/oplata/get', async(req,res) => {
//     let {path} = req.query
//     if (!path) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных данных ошибок')
//     }

//     let transaction = await Transaction.findOne({pathNum: path}).select('type money createdAt recieverCard')

//     if(!transaction) {
//         return res.status(409).send('Транзакции не существует')
//     }

//     res.status(200).send(transaction)
// })

// app.post('/transaction/accept', async(req,res) => {
//     let {code, path} = req.body
//     if (!code || !path) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных данных ошибок')
//     }

//     let transaction = await Transaction.findOne({pathNum: path})

//     if(!transaction) {
//         return res.status(409).send('Транзакции не существует')
//     }

//     let operationDate = dayjs(transaction.createdAt)
//     let now = dayjs()

//     let difference = now.diff(operationDate, 'seconds')
//     if(difference > 300) {
//         await transaction.deleteOne()
//         return res.status(404).send('Операция больше недействительна, так как время на ввод кода закончилось')
//     }

//     let check = await bcrypt.compare(code, transaction.codeNum)

//     if(!check) {
//         return res.status(409).send('Код подтверждения не подходит')
//     }

//     let senderCardNum = await Card.findOne({uniqueCardNumber: transaction.senderCard})
//     let recieverCardNum = await Card.findOne({uniqueCardNumber: transaction.recieverCard})

//     if(!recieverCardNum || !senderCardNum) {
//         return res.status(409).send('Получатель не найден')
//     }
    
//     let sender = await User.findOne({cards: {$elemMatch: {$eq: String(senderCardNum._id)}}})
//     let reciever = await User.findOne({cards: {$elemMatch: {$eq: String(recieverCardNum._id)}}})

//     if(!reciever) {
//         return res.status(409).send('Получатель не найден')
//     } else if (!sender) {
//         return res.status(409).send('Вы не зарегистрированы')
//     }

//     senderCardNum.balance = Number(senderCardNum.balance) - Number(transaction.money)
//     senderCardNum.expenses = Number(senderCardNum.expenses) + Number(transaction.money)
//     recieverCardNum.balance = Number(recieverCardNum.balance) + Number(transaction.money)
//     senderCardNum.transactions.push(transaction._id)
//     recieverCardNum.transactions.push(transaction._id)

//     await senderCardNum.save()
//     await recieverCardNum.save()

//     sender.expensesAll = Number(sender.expensesAll) + Number(transaction.money)
//     reciever.depositsAll = Number(reciever.depositsAll) + Number(transaction.money)

//     await sender.save()
//     await reciever.save()

//     transaction.type = 'shifting'
//     transaction.pathNum = null
//     transaction.codeNum = null

//     if(transaction.payloadCode != null) {
//         jwt.verify(transaction.payloadCode.replace(/2EE/g, '.'), process.env.CRYPTION_PAYMENT, (error, decoded) => {
//             if(error) {
//                 return res.status(409).send('Ошибка передачи данных на сервер')
//             }
            
//             req.redirectTo = decoded.redirectTo
//             req.payload = decoded.unique
//             req.routePay = decoded.routeTopUp
//         })

//         transaction.payloadCode = null
//     }

//     await transaction.save()

//     res.status(200).send({payload: req.payload, routePay: req.routePay, redirectTo: req.redirectTo})
// })











// app.post('/support/ask', VerifyUser, async(req,res) => {
//     let {prompt} = req.body

//     if (!prompt) {
//         return res.status(422).send('Запрос был правильно сформирован, но не смог быть выполнен из-за переданных данных ошибок')
//     }

//     let user = await User.findOne({_id: req.userJWT})

//     if(!user) {
//         return res.status(401).send('Вы не авторизованы')
//     }

//     await openai.chat.completions.create({
//         model: 'gpt-3.5-turbo',
//         messages: [
//             { role: 'user', content: prompt },
//         ]
//         // max_tokens: 500,
//         // temperature: 0,
//         // top_p: 1.0,
//         // frequency_penalty: 0.0,
//         // presence_penalty: 0.0
//     }).then(async (response) => {
//         let message = new Message({
//             question: prompt,
//             answer: response.choices[0].message.content
//         })

//         await message.save()

//         user.messages.push(message._id)

//         await user.save()
//     })

//     res.status(200).send('Вопрос отправлен')
// })

// app.get('/support/messages', VerifyUser, async (req,res) => {
//     let user = await User.findOne({_id: req.userJWT}).populate({path: 'messages'})

//     if(!user) {
//         return res.status(401).send('Вы не авторизованы')
//     }

//     res.status(200).send({messages: user.messages})
// })
