let express = require('express')
let router = express.Router()
let {body, query} = require('express-validator')
let UserController = require('../controllers/user-controller')
let CardController = require('../controllers/card-controller')
let TransactionController = require('../controllers/transaction-controller')
let SupportController = require('../controllers/support-controller')
let authMiddleware = require('../middlewares/auth-middleware')

router.post('/registration',
    body('name')
    .isLength({min: 2, max: 12})
    .withMessage('Имя пользователя должно быть не менее 2 и не более 12 символов в длину')
    .matches(/^[а-яА-Я]+$/)
    .withMessage('Имя должно содержать только кириллицу'),
    body('mail')
    .isEmail()
    .withMessage('Некорректная почта')
    .isLength({min: 10, max: 64})
    .withMessage('Почта должна быть не менее 10 и не более 64 символов в длину'),
    body('password')
    .isLength({min: 5, max: 32})
    .withMessage('Пароль должен быть не менее 5 символов и не более 32 символов в длину')
    .isAlpha()
    .withMessage('Пароль должен содержать только латиницу'),
    UserController.registration
)
router.post('/login', UserController.login)
router.get('/activate', UserController.activate)
router.get('/refresh', UserController.refresh)
router.get('/user/main', authMiddleware, UserController.main)
router.post('/user/fill',
    body('lasName')
    .isLength({min: 2, max: 32})
    .withMessage('Фамилия должна быть не менее 2 и не более 32 символов в длину')
    .matches(/^[а-яА-Я]+$/)
    .withMessage('Фамилия должна содержать только кириллицу'),
    body('patronymic')
    .isLength({min: 2, max: 32})
    .withMessage('Отчество должно быть не менее 2 и не более 32 символов в длину')
    .matches(/^[а-яА-Я]+$/)
    .withMessage('Фамилия должна содержать только кириллицу'),
    authMiddleware,
    UserController.fill
)
router.post('/card/create',
    body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Дата должна быть в формате YYYY-MM-DD'),
    body('tel')
    .matches(/^\+7[0-9]{10}$/)
    .withMessage('Некорректный номер телефона'),
    authMiddleware,
    CardController.create
)
router.get('/card/get',
    query('compressed')
    .isBoolean()
    .withMessage('Поле compressed должно быть типа boolean'),
    authMiddleware,
    CardController.get)
router.delete('/card/delete', authMiddleware, CardController.delete) 
router.post('/transaction/crypt', TransactionController.crypt)
router.post('/payment/create', TransactionController.paymentCreate)
router.post('/transaction/create', authMiddleware, TransactionController.create)
router.get('/oplata/get', TransactionController.oplata)
router.post('/transaction/accept', TransactionController.accept) 
router.post('/support/ask',
    body('prompt')
    .isLength({min: 5, max: 250})
    .withMessage('Длина вопроса должна быть не менее 5 и не более 250 токенов'), 
    authMiddleware,
    SupportController.ask
)
router.get('/support/messages',  authMiddleware, SupportController.messages)

router.post('/logout', UserController.logout)

module.exports = router