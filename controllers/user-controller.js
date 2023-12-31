let ServerError = require('../exceptions/server-error')
let {validationResult} = require('express-validator')
let UserService = require('../services/user-service')

class UserController {
    async registration(req,res,next) {
        try {
            let errors = validationResult(req)
            if(!errors.isEmpty()) {
                return next(ServerError.BadRequest('Ошибка валидации', errors.array()))
            }

            let {name, mail, password} = req.body

            if(!name || !mail || !password) {
                return next(ServerError.unProcessed())
            }

            await UserService.registration(name, mail, password)
            return res.status(200).json({message: 'Вы успешно зарегистрировали пользователя'})
        } catch(error) {
            next(error)
        }
    }

    async login(req,res,next) {
        try {
            let {mail,password} = req.body

            if(!mail || !password) {
                return next(ServerError.unProcessed())
            }

            let data = await UserService.login(mail, password)
            
            res.cookie(process.env.COOKIE_USER, data.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000 * 5,
            })
            return res.status(200).json({message: 'Вы успешно вошли в аккаунт', data})
        } catch(error) {
            next(error)
        }
    }

    async fill(req,res,next) {
        try {
            let errors = validationResult(req)
            if(!errors.isEmpty) {
                return next(ServerError.BadRequest('Ошибка валидации'), errors.array())
            }
            let {lastName, patronymic} = req.body

            if(!lastName || !patronymic) {
                return next(ServerError.unProcessed())
            }

            await UserService.fill(req.userJWT.id, lastName, patronymic)

            return res.status(200).json({message: 'Данные заполнены'})
        } catch(error) {
            next(error)
        }
    }

    async main(req,res,next) {
        try {
            let user = await UserService.getUser(req.userJWT.id)
            
            return res.status(200).send(user)
        } catch(error) {
            next(error)
        }
    }

    async activate(req,res,next) {
        try {
            let {link, mail} = req.query
            if(!link) {
                return next(ServerError.unProcessed())
            }

            await UserService.activate(link, mail)

            return res.status(200).json({message: 'Почта подтверждена'})
        } catch(error) {
            next(error)
        }
    }

    async logout(req,res,next) {
        try {
            let {refreshToken} = req.cookies

            await UserService.logout(refreshToken)

            res.clearCookie(process.env.COOKIE_USER, {sameSite: 'none', secure: true})
            return res.status(200).json({message: 'Вы вышли из аккаунта'})
        } catch(error) {
            next(error)
        }
    }

    async refresh(req,res,next) {
        try {
            let {refreshToken} = req.cookies

            if(!refreshToken) {
                throw ServerError.unProcessed()
            }

            let userData = await UserService.refresh(refreshToken)
            
            res.cookie(process.env.COOKIE_USER, userData.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000 * 5
            })

            return res.status(200).json({message: 'Токен перезагружен', userData})
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController()