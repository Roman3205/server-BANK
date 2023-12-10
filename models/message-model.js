let mongoose = require('mongoose')

let messageSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 100
    },
    answer: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Message', messageSchema)