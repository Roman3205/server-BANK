let mongoose = require('mongoose')

let transactionSchema = new mongoose.Schema({
    type: {
        type: Number,
        trim: true,
        required: true
    },
    money: {
        type: Number,
        min: 5,
        required: true
    },
    status: {
        type: Number,
        trim: true,
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
        required: true,
        trim: true,
        minLength: 49,
        maxLength: 49
    },
    codeNum: {
        type: String,
        required: true,
        trim: true
    },
    payloadCode: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Transaction', transactionSchema)