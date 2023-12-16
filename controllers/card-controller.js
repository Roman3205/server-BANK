const { validationResult } = require("express-validator")
const ServerError = require("../exceptions/server-error")
let CardService = require('../services/card-service')

class CardController {
    async create(req,res,next) {
        try {
            let errors = validationResult(req)
            if(!errors.isEmpty()) {
                return next(ServerError.BadRequest('Ошибка валидации', errors.array()))
            }
            
            let {date, tel} = req.body

            if(!date || !tel) {
                return next(ServerError.unProcessed())
            }

            await CardService.create(req.userJWT.id, date, tel)

            return res.status(200).json({message: 'Карта успешно создана'})
        }
        catch(error) {
            next(error)
        }
    }

    async get(req,res,next) {
        try {
            let errors = validationResult(req)
            if(!errors.isEmpty()) {
                return next(ServerError.BadRequest('Ошибка валидации', errors.array()))
            }

            let {cardNumber, compressed} = req.query

            if(!cardNumber || !compressed) {
                return next(ServerError.unProcessed())
            }

            let card = await CardService.get(req.userJWT.id, cardNumber, compressed)

            return res.status(200).json({card})
        } catch(error) {
            next(error)
        }
    }

    async delete(req,res,next) {
        try {
            let {cardId} = req.query

            if(!cardId) {
                return next(ServerError.unProcessed())
            }

            await CardService.delete(req.userJWT.id, cardId)

            return res.status(200).json({message: 'Карта успешно удалена'})
        } catch(error) {
            next(error)
        }
    }
}

module.exports = new CardController()