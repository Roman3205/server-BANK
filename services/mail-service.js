let nodemailer = require('nodemailer')
let dotenv = require('dotenv');
const path = require('path');
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
        await this.transporter.sendMail({
            from: process.env.YANDEX_MAIL,
            to: mail,
            subject: 'Микробанк',
            html: `
                <p>Данный почтовый адрес был указан при регистрации нового пользователя на сайте ${process.env.URL_SELF}.</p>
                <p>Если это сделали не вы, пожалуйста, проигнорируйте данное письмо.</p>
                <span>Активировать аккаунт:</span> <strong><h3>${link}</h3></strong>
            `
        })
    }
}

module.exports = new MailService()