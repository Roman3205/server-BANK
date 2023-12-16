let nodemailer = require('nodemailer')
let dotenv = require('dotenv');
const path = require('path');
const ServerError = require('../exceptions/server-error');
dotenv.config({path: path.resolve(__dirname, '../.env')})

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.yandex.ru',
            port: 465,
            secure: true,
            auth: {
                user: process.env.YANDEX_MAIL,
                pass: process.env.YANDEX_PASSWORD
            }
        })
    }

    async sendActivationMail(mail, link) {
        try {
            await this.transporter.sendMail({
                from: process.env.YANDEX_MAIL,
                to: mail,
                subject: 'Микробанк',
                html: `
                    <p>Данный почтовый адрес был указан при регистрации нового пользователя на сайте ${process.env.URL_SELF}.</p>
                    <p>Если это сделали не вы, пожалуйста, проигнорируйте данное письмо.</p>
                    <span>Активировать аккаунт:</span> <strong><h3>${link}</h3></strong>
                `
            }, (error, info) => {
                if(error) {
                    throw ServerError.BadRequest('Произошла ошибка с отправкой кода')
                }
                if(info) {
                    return true
                }
            })
        } catch (error) {
            throw ServerError.BadRequest('Произошла ошибка с отправкой кода')
        }

    }

    async sendConfirmationCode(mail, number) {
        try {
            await this.transporter.sendMail({
                from: process.env.YANDEX_MAIL,
                to: mail,
                subject: 'МикроБанк',
                // text: `С вашего аккаунт будет совершена операция по переводу\n Если это сделали не вы - не переходите по ссылке \n ${number}`
                html: `
                    <p>С вашего аккаунта будет совершена операция по переводу.</p>
                    <p>Если это сделали не вы, пожалуйста, проигнорируйте данное письмо.</p>
                    <span>Код подтверждения:</span> <strong><h3>${number}</h3></strong>
                `
            }, (error, info) => {
                if(error) {
                    throw ServerError.BadRequest('Произошла ошибка с отправкой кода')
                }
                if(info) {
                    return true
                }
            })
        } catch (error) {
            throw ServerError.BadRequest('Произошла ошибка с отправкой кода')
        }
    }
}

module.exports = new MailService()