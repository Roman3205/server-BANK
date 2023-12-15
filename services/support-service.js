const ServerError = require("../exceptions/server-error")
const User = require("../models/user-model")
const OpenAiService = require("./openai-service")
let Message = require('../models/message-model')

class SupportService {
    async ask(req, prompt) {
        let user = await User.findOne({_id: req.userJWT.id})

        if(!user) {
            throw ServerError.Unauthorized()
        }

        let response = await OpenAiService.ask(prompt)

        let message = await Message.create({
            question: prompt,
            answer: response.choices[0].message.content
        })

        user.messages.push(message.id)
        return await user.save()
    }
}

module.exports = new SupportService()