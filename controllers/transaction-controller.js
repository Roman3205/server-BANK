const ServerError = require("../exceptions/server-error")
let dotenv = require('dotenv');
const path1 = require('path');
dotenv.config({path: path1.resolve(__dirname, '../.env')})
let TransactionService = require('../services/transaction-service')

class TransactionController {
    async create(req,res,next) {
        try {
            let {money, fromCard, toCard} = req.body
            if (!money || !fromCard || !toCard) {
                return next(ServerError.unProcessed())
            }

            let path = await TransactionService.create(req.userJWT.id, money, fromCard, toCard)

            return res.status(200).json({oplata: path})
        } catch(error) {
            next(error)
        }
    }

    async crypt(req,res,next) {
        try {
            let {money, toCard, unique, redirectTo, routeTopUp} = req.body
            if(!money || !toCard || !unique || !redirectTo || !routeTopUp) {
                return next(ServerError.unProcessed())
            }

            let payload = await TransactionService.crypt(money, toCard, unique, redirectTo, routeTopUp)

            // /[.]/g or /\./g
            return res.status(200).json({path: payload.replace(/\./g, '2EE'), urlBank: `${process.env.URL_SELF}`})
        } catch (error) {
            next(error)
        }
    }

    async paymentCreate(req,res,next) {
        try {
            let {payload, cvv, cardNum, dateExp} = req.body
            if (!payload || !cvv || !cardNum || !dateExp) {
                return next(ServerError.unProcessed())
            }

            let path = await TransactionService.paymentCreate(payload, cvv, cardNum, dateExp)

            return res.status(200).json({oplata: path})
        } catch (error) {
            next(error)
        }
    }

    async oplata(req,res,next) {
        try {
            let {path} = req.query
            if(!path) {
                return next(ServerError.unProcessed())
            }

            let transaction = await TransactionService.oplata(path)

            return res.status(200).json({transaction})
        } catch (error) {
            next(error)
        }
    }

    async accept(req,res,next) {
        try {
            let {code, path} = req.body
            if(!code || !path) {
                return next(ServerError.unProcessed())
            }

            let data = await TransactionService.accept(code, path)

            return res.status(200).json({data})
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new TransactionController()