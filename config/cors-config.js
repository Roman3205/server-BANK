let corsOptions = {
    origin: (origin, callback) => {
        if(process.env.URL_CLIENT_ALLOW.includes(origin) || !origin) {
            callback(null, true)
        } else {
            throw new Error('Not allowed by CORS')
        }
    },
    credentials: true
}
// || !origin for postman

module.exports = corsOptions