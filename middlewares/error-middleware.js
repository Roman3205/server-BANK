let ServerError = require('../exceptions/server-error')

module.exports = function(error,req,res,next) {
    if(error instanceof ServerError) {
        return res.status(error.status).json({message: error.message, errors: error.errors})
    }
    
    return res.status(500).json({message: 'Ошибка на стороне сервера'})
}