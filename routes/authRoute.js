import express from 'express'
import { validationfield } from '../field_valodator/index.js'
import { check } from 'express-validator'
import message from '../utilities/messages/message.js'
import { createAccount, generateNewAccessTokenAndRefreshToken, login } from '../controllers/userController.js'
const route = express.Router()

// login
// route.post('/login', [check('name').notEmpty().withMessage(message?.nameRequired)], validationfield, Login)

// user_registration
route.post('/create-account', [check('username').notEmpty().withMessage(message?.userNameMustBeRequired),
  check('email').notEmpty().withMessage(message?.emailMustBeRequired),
  check('password').notEmpty().withMessage(message?.passwordMustBeRequired).isLength({ min: 8 })
    .withMessage(message?.passwordFormatIsNotValid)

], validationfield, createAccount)

// user_registration
route.post('/user-login', [
  check('email').notEmpty().withMessage(message?.emailMustBeRequired),
  check('password').notEmpty().withMessage(message?.passwordMustBeRequired)

], validationfield, login)

// generate new access and refersh token
route.post('/generate-token', [check('refresh_token').notEmpty().withMessage(message?.accessTokenMustBeRequired)], validationfield, generateNewAccessTokenAndRefreshToken)

export default route
