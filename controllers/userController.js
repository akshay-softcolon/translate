import config from '../config/index.js'
import { UserModel } from '../models/userModels.js'
import logger from '../utilities/logger.js'
import message from '../utilities/messages/message.js'
import { sendBadRequest, sendSuccess } from '../utilities/response/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// create account
export const createAccount = async (req, res) => {
  try {
    const data = req.body
    const userData = await UserModel.findOne({ email: data.email })
    if (userData) {
      return sendBadRequest(res, message.userAlreadyExist)
    }
    const hashPassword = await bcrypt.hashSync(data.password, 10)
    const newUserData = new UserModel({
      username: data.username,
      email: data.email,
      password: hashPassword
    })
    await newUserData.save()
    return sendSuccess(res, message.accountCreatedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('CREATE_ACCOUNT')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// user login
export const login = async (req, res) => {
  try {
    const data = req.body
    const userData = await UserModel.findOne({ email: data.email })
    if (!userData) {
      return sendBadRequest(res, message.userNotFound)
    }
    const compare = await bcrypt.compare(data.password, userData.password)
    if (!compare) {
      return sendBadRequest(res, message.invalidPassword)
    }
    const accessTokenId = crypto.randomBytes(30).toString('hex')
    const refreshTokenId = crypto.randomBytes(30).toString('hex')
    const token = jwt.sign({
      id: userData._id,
      accessTokenId
    },
    config?.USER_ACCESS_TOKEN,
    { expiresIn: config?.USER_ACCESS_TOKEN_EXP * 60 }
    )

    const refreshToken = jwt.sign({
      id: userData._id,
      refreshTokenId
    },
    config.USER_REFRESH_TOKEN,
    { expiresIn: config?.USER_ACCESS_TOKEN_EXP * 60 }
    )
    userData.access_token_id = accessTokenId
    userData.refresh_token_id = refreshTokenId

    await userData.save()
    return sendSuccess(res, { token, refreshToken }, message.loginSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('LOGIN')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// generateNewAccessTokenAndRefreshToken
export const generateNewAccessTokenAndRefreshToken = async (req, res) => {
  try {
    const token = req?.body?.refresh_token
    jwt.verify(token, config.REFRESH_TOKEN, async (err, decoder) => {
      if (err) {
        return sendBadRequest(res, message?.invalidToken)
      }
      const userData = await UserModel.findOne({ _id: decoder?.id })
      if (!userData) {
        return sendBadRequest(res, message?.userNotFound)
      }
      if (userData.refresh_token_id !== decoder?.refreshTokenId) {
        return sendBadRequest(res, message?.invalidToken)
      }
      const accessTokenId = crypto.randomBytes(30).toString('hex')
      const refreshTokenId = crypto.randomBytes(30).toString('hex')
      //   generate accesstoken
      const newAccessToken = jwt.sign({ id: decoder?.id, accessTokenId },
        config?.ACCESS_TOKEN,
        { expiresIn: config?.ACCESS_TOKEN_EXP * 60 }
      )
      // generate refreshtoken
      const newRefreshToken = jwt.sign({ id: decoder?.id, refreshTokenId },
        config.REFRESH_TOKEN,
        { expiresIn: config?.REFRESH_TOKEN_EXP * 60 }
      )
      userData.access_token_id = accessTokenId
      userData.refresh_token_id = refreshTokenId
      await userData.save()
      return sendSuccess(res, { access_token: newAccessToken, refresh_token: newRefreshToken }, message?.loginSuccessfully)
    })
  } catch (e) {
    logger.error(e)
    logger.error('Generate_New_Access_Token_And_Refresh_Token')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}
