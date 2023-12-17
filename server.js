let express = require('express')
let app = express()
let dotenv = require('dotenv')
let path = require('path')
let cookieParser = require('cookie-parser')
let cors = require('cors')
let mongoose = require('mongoose')
let corsOptions = require('./config/cors-config')
let router = require('./router/router')
let errorMiddleware = require('./middlewares/error-middleware')

dotenv.config({path: path.resolve(__dirname, './.env')})

app
    .use(express.json())
    .use(cookieParser())
    .use(cors(corsOptions))
    .use('/server', router)
    .use(errorMiddleware)

mongoose.set('strictQuery', false)

let uri = process.env.MONGODB_HOST
let backPort = process.env.VITE_BACKEND_PORT
let backHost = process.env.BACKEND_HOST

let start = async () => {
    try {
        mongoose.connect(uri).catch(error => console.log('Произошла ошибка с подключением бд'))
        app.listen(backPort, () => {
            console.log(backHost);
        })
    } catch (error) {
        console.log(error);
    }
}

start()