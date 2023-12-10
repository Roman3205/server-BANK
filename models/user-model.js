let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 2,
        maxLength: 10,
        required: true,
        trim: true
    },
    lastName: {
        type: String
    },
    patronymic: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    mail: {
        type: String,
        minLength: 6,
        maxLength: 32,
        required: true,
        trim: true,
        unique: true
    },
    activationLink: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    isActivated: {
        type: Boolean,
        required: true
    },
    cards: [{
        type: mongoose.ObjectId,
        ref: 'Card'
    }],
    depositsAll: {
        type: Number,
        min: 0,
        required: true
    },
    expensesAll: {
        type: Number,
        min: 0,
        required: true
    },
    savingsAll: {
        type: Number,
        min: 0,
        required: true
    },
    messages: [{
        type: mongoose.ObjectId,
        ref: 'Message'
    }],
    carrierBirth: {
        type: String,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)