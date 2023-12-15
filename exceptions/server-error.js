module.exports = class ServerError extends Error {
    status
    errors

    constructor(status, message, errors) {
        super(message)
        this.status = status
        this.errors = errors
    }

    static Unauthorized() {
        return new ServerError(401, 'Пользователь не авторизован')
    }

    static notFound() {
        return new ServerError(404, 'Не найдено')
    }

    static BadRequest(message, errors = []) {
        return new ServerError(400, message, errors)
    }

    static Conflict() {
        return new ServerError(409, 'Конфликт содержимого с обработкой')
    }

    static unProcessed() {
        return new ServerError(422, 'Ошибки с обработкой передаваемых данных')
    }
}