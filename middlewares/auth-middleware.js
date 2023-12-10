const ServerError = require("../exceptions/server-error")
const TokenService = require("../services/token-service")

module.exports = function(req,res,next) {
    try {
        let token = req.headers.authorization
        if(!token) {
            return next(ServerError.Unauthorized())
        }

        let accessToken = token.split(' ')[1]
        if(!accessToken) {
            return next(ServerError.Unauthorized())
        }

        let userData = TokenService.validateAccessToken(accessToken)
        if(!userData) {
            return next(ServerError.Unauthorized())
        }

        req.userJWT = userData
        next()
    } catch (error) {
        return next(ServerError.Unauthorized())
    }
}