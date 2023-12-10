let jwt = require('jsonwebtoken')
let dotenv = require('dotenv');
const path = require('path');
dotenv.config({path: path.resolve(__dirname, '../.env')})
let Token = require('../models/token-model')

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
}

module.exports = new TokenService()