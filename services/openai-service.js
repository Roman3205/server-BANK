let openAI = require('openai')
let dotenv = require('dotenv')
let path = require('path')
dotenv.config({path: path.resolve(__dirname, '../.env')})

class OpenAiService {
    constructor() {
        this.openai = new openAI({
            apiKey: process.env.OPENAI_KEY
        })
    }
    async ask(prompt) {
        let response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: prompt },
            ],
            // max_tokens: 500,
            // temperature: 0,
            // top_p: 1.0,
            // frequency_penalty: 0.0,
            // presence_penalty: 0.0
        })

        return response
    }
}

module.exports = new OpenAiService()