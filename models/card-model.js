let mongoose = require('mongoose')

let cardSchema = new mongoose.Schema({
    balance: {
        type: Number,
        min: 0,
        required: true
    },
    holdersName: {
        type: String,
        ref: 'User',
        minLength: 2,
        maxLength: 10,
        trim: true,
        required: true
    },
    holdersSurname: {
        type: String,
        ref: 'User',
        minLength: 2,
        maxLength: 15,
        trim: true,
        required: true
    },
    holdersPatronymic: {
        type: String,
        ref: 'User',
        minLength: 2,
        maxLength: 18,
        trim: true,
        required: true
    },
    expenses: {
        type: Number,
        min: 0,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    CVV: {
        type: Number,
        default: null,
        max: 999,
        min: 100
    },
    uniqueCardNumber: {
        type: Number,
        unique: true,
        required: true,
        min: 2023000000000000,
        max: 2023999999999999
    },
    transactions: [{
        type: mongoose.ObjectId,
        ref: 'Transaction'
    }],
    tel: {
        type: String,
        trim: true,
        required: true,
        minLength: 12,
        maxLength: 12,
        unique: true
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('Card', cardSchema)