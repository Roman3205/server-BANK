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
        type: String,
        default: '',
        maxLength: 32,
        trim: true
    },
    patronymic: {
        type: String,
        default: '',
        maxLength: 32,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
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
        default: null,
        unique: true,
        trim: true
    },
    isActivated: {
        type: Boolean,
        default: false
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
        default: ''
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)