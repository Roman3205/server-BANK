let mongoose = require('mongoose')

let transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        trim: true,
        required: true
    },
    money: {
        type: Number,
        min: 5,
        required: true
    },
    uniqueNumber: {
        type: Number,
        trim: true,
        required: true,
        min: 2738193120234325,
        max: 7479464824726374
    },
    sender: {
        type: mongoose.ObjectId,
        required: true,
        ref: 'User'
    },
    senderCard: {
        type: Number,
        unique: true,
        required: true,
        min: 2023000000000000,
        max: 2023999999999999
    },
    reciever: {
        type: mongoose.ObjectId,
        required: true,
        ref: 'User'
    },
    recieverCard: {
        type: Number,
        unique: true,
        required: true,
        min: 2023000000000000,
        max: 2023999999999999
    },
    pathNum: {
        type: String,
        default: null,
        minLength: 50,
        maxLength: 50
    },
    codeNum: {
        type: String,
        default: null
    },
    payloadCode: {
        type: String,
        default: null,
        trim: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Transaction', transactionSchema)