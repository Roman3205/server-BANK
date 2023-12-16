const ServerError = require("../exceptions/server-error")
const SupportService = require("../services/support-service")
let {validationResult} = require('express-validator')

class SupportController {
    async ask(req,res,next) {
        try {
            let errors = validationResult(req)
            if(!errors.isEmpty()) {
                return next(ServerError.BadRequest('Ошибка валидации', errors.array()))
            }
            
            let {prompt} = req.body

            if(!prompt) {
                return next(ServerError.unProcessed)
            }

            await SupportService.ask(req.userJWT.id, prompt)
            
            return res.status(200).json({message: 'Вопрос отправлен'})
        } catch(error) {
            next(error)
        }
    }

    async messages(req,res,next) {
        try {
            let messages = await SupportService.messages(req.userJWT.id)

            return res.status(200).json({messages})
        } catch(error) {
            next(error)
        }
    }
}

module.exports = new SupportController()