let ServerError = require('../exceptions/server-error')
let User = require('../models/user-model')
let MailService = require('./mail-service')
let bcrypt = require('bcrypt')
let TokenService = require('./token-service')
let Card = require('../models/card-model')
let uuid = require('uuid')

class UserService {
    async findLink(link) {
        let existLink = await User.findOne({activationLink: link})
        
        return existLink
    }

    async findUserViaCard(cardId) {
        let user = await User.findOne({cards: {$elemMatch: {$eq: String(cardId)}}})

        return user
    }

    async createActivationLink() {
        while(true) {
            let activationLink = uuid.v4()
            let existLink = await this.findLink(activationLink)

            if(!existLink) {
                return activationLink
            }
        }
    }

    async registration(name, mail, password) {
        let user = await User.findOne({mail: mail})

        if(user) {
            throw ServerError.BadRequest(`Пользователь с почтовым адресом ${mail} уже существует`)
        }
    
        let salt = await bcrypt.genSalt(10)
        let hashedPassword = await bcrypt.hash(password, salt)
        let link = await this.createActivationLink()
    
        await MailService.sendActivationMail(mail, `${process.env.URL_SELF}/activate/${link}`)
        await User.create({
            firstName: name,
            lastName: '',
            patronymic: '',
            password: hashedPassword,
            mail: mail,
            activationLink: link,
            isActivated: false,
            cards: [],
            depositsAll: 0,
            expensesAll: 0,
            savingsAll: 0,
            messages: [],
            carrierBirth: ''
        })

    
        return true
    }

    async fill(jwt, lastName, patronymic) {
        let user = await User.findOne({_id: jwt})

        if(!user)  {
            throw ServerError.Unauthorized()
        }

        user.lastName = lastName
        user.patronymic = patronymic

        return await user.save()
    }

    async login(mail, password) {
        let user = await User.findOne({mail: mail})
        if(!user) {
            throw ServerError.BadRequest('Аккаунта не существует')
        } else if(user.isActivated == false) {
            throw ServerError.BadRequest('У аккаунта не активирована почта')
        }

        let passwordCheck = await bcrypt.compare(password, user.password)
        if(!passwordCheck) {
            throw ServerError.BadRequest('Неверный пароль') 
        }

        let payload = {
            id: user._id,
            mail: mail
        }
        let tokens = TokenService.generateTokens(payload)
        await TokenService.saveTokens(user._id, tokens.refreshToken)

        return {
            ...tokens
        }
    }

    async activate(link, mail) {
        let activationLink = await User.findOne({activationLink: link})
        if(!activationLink) {
            throw ServerError.BadRequest('Некорректная ссылка активации')
        } else if(activationLink.isActivated == true) {
            throw ServerError.BadRequest('Почта уже подтверждена')
        } else if(activationLink.mail != mail) {
            throw ServerError.BadRequest('Указанная почта вам не принадлежит')
        }

        activationLink.isActivated = true
        activationLink.activationLink = null

        return await activationLink.save()
    }

    async logout(refreshToken) {
        await TokenService.removeToken(refreshToken)
        return true
    }

    async getUser(jwt) {
        let user = await User.findOne({_id: jwt}).select('_id firstName lastName patronymic mail cards depositsAll expensesAll savingsAll messages carrierBirth').populate({
            path: 'cards',
            options: {
                sort: {
                    createdAt: -1
                }
            },
            select: '_id balance holdersName holdersSurname holdersPatronymic expirationDate uniqueCardNumber transactionsTo transactionsFrom'
        })
            
        if(!user) {
            throw ServerError.Unauthorized()
        }
            
        return user
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ServerError.Unauthorized()
        }
        
        let userData = TokenService.validateRefreshToken(refreshToken)
        let tokenDB = await TokenService.findToken(refreshToken)
        
        if(!userData || !tokenDB) {
            throw ServerError.BadRequest('Такого токена не существует')
        }

        let user = await User.findById(userData.id)
        let payload = {
            id: user._id,
            mail: user.mail
        }

        let tokens = TokenService.generateTokens(payload)
        await TokenService.saveTokens(user._id, tokens.refreshToken)

        return {
            ...tokens
        }
    }
}

module.exports = new UserService()