let jwt = require('jsonwebtoken')
let dotenv = require('dotenv');
const path = require('path');
dotenv.config({path: path.resolve(__dirname, '../.env')})
let Token = require('../models/token-model');
const ServerError = require('../exceptions/server-error');

class TokenService {
    generateTokens(payload) {
        let accessToken = jwt.sign(payload, process.env.JWT_ACCESS, {
            expiresIn: '30m'
        })

        let refreshToken = jwt.sign(payload, process.env.JWT_REFRESH, {
            expiresIn: '5d'
        })

        return {accessToken, refreshToken}
    }

    validateAccessToken(token) {
        try {
            let userData = jwt.verify(token, process.env.JWT_ACCESS)
            return userData
        } catch (error) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            let userData = jwt.verify(token, process.env.JWT_REFRESH)
            return userData
        } catch(error) {
            return error
        }
    }

    payloadVerify(payloadCode) {
        let redirectTo
        let payload
        let routePay

        jwt.verify(payloadCode.replace(/2EE/g, '.'), process.env.CRYPTION_PAYMENT, (error, decoded) => {
            if(error) {
                throw ServerError.BadRequest('Время на оплату закончилось, конфликт содержимого')
            }
                        
            redirectTo = decoded.redirectTo
            payload = decoded.unique
            routePay = decoded.routeTopUp
        })

        return {
            redirectTo, payload, routePay
        }
    }

    paymentVerify(payload) {
        let money
        let cardLoad

        jwt.verify(payload.replace(/2EE/g, '.'), process.env.CRYPTION_PAYMENT, (error, decoded) => {
            if(error) {
                throw ServerError.BadRequest('Время на оплату закончилось, конфликт содержимого')
            }
                    
            money = decoded.money
            cardLoad = decoded.card
        })

        return {
            money, cardLoad
        }
    }

    async removeToken(refreshToken) {
        let token = await Token.deleteOne({refreshToken: refreshToken})
        return token
    }

    async findToken(refreshToken) {
        let token = await Token.findOne({refreshToken: refreshToken})
        return token
    }

    async saveTokens(id, token) {
        let tokenSaved = await Token.findOne({user: id})
        if(tokenSaved) {
            tokenSaved.refreshToken = token
            return tokenSaved.save()
        }

        let refreshToken = await Token.create({user: id, refreshToken: token})

        return refreshToken
    }

    signPayload(money, toCard, unique, redirectTo, routeTopUp) {
        let payload = jwt.sign({money: money, card: toCard, unique: unique, redirectTo: redirectTo, routeTopUp: routeTopUp}, process.env.CRYPTION_PAYMENT, {
            algorithm: 'HS256',
            expiresIn: '20m'
        })

        return payload
    }
}

module.exports = new TokenService()