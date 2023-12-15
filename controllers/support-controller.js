const ServerError = require("../exceptions/server-error")
const SupportService = require("../services/support-service")

class SupportController {
    async ask(req,res,next) {
        try {
            let {prompt} = req.body

            if(!prompt) {
                return next(ServerError.unProcessed)
            }

            await SupportService.ask(req, prompt)
            
            return res.status(200).json({message: 'Вопрос отправлен'})
        } catch(error) {
            next(error)
            console.log(error);
        }
    }

    async messages(req,res,next) {
        try {
            
        } catch(error) {
            next(error)
        }
    }
}

module.exports = new SupportController()