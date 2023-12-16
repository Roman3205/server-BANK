const Card = require('../models/card-model')
let Transaction = require('../models/transaction-model')
let dayjs = require('dayjs')

class HandlersService {
    getDifference(date) {
        let now = dayjs()
        let transactionDate = dayjs(date)
        let difference = now.diff(transactionDate, 'seconds')

        return difference
    }

    async createNumber() {
        while(true) {
            let result = ''
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

            for(let i = 0; i < 50; i++) {
                let randomNumber = Math.floor(Math.random() * characters.length)
                result += characters.charAt(randomNumber)
            }

            let existNumber = await Transaction.findOne({pathNum: result})

            if(!existNumber) {
                return result
            }
        }
    }

    randomTransactionNumber() {
        let min = 2738193120234325
        let max = 7479464824726374

        return Math.floor(Math.random() * (max-min) + min)
    }

    async createTransactionNumber() {
        while(true) {
            let number = this.randomTransactionNumber()
            let existNumber = await Transaction.findOne({uniqueNumber: number})

            if(!existNumber) {
                return number
            }
        }
    }

    codeGenerate() {
        let number = Math.floor(Math.random() * (999999-111111) + 111111)

        return number
    }

    randomCardNumber() {
        let min = 2023300050004500
        let max = 2023888899994444

        return Math.floor(Math.random() * (max-min) + min)
    }

    createRandomCVV() {
        let min = 111
        let max = 999

        return Math.floor(Math.random() * (max-min) + min)
    }
    
    async createCardNumber() {
        while(true) {
            let number = this.randomCardNumber()
            let existNumber = await Card.findOne({uniqueCardNumber: number})

            if(!existNumber) {
                return number
            }
        }
    }
}

module.exports = new HandlersService()