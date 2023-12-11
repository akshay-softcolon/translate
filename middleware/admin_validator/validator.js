import jwt from 'jsonwebtoken'
import { sendBadRequest, sendBadRequestWith406Code } from '../../utilities/response/index.js'
import message from '../../utilities/messages/message.js'
import config from '../../config/index.js'
import { UserModel } from '../../models/userModels.js'
import logger from '../../utilities/logger.js'
import { ProjectModel } from '../../models/projectModels.js'
// import jwt from jwt

export const isAdmin = async (req, res, next) => {
  try {
    // find token in headers
    const bearerToken = req.headers.authorization
    // if token find then verify
    if (!bearerToken) return sendBadRequestWith406Code(res, message.authTokenRequired)

    const tokenInfo = await jwt.verify(
      String(bearerToken).split(' ')[1],
      config.ACCESS_TOKEN
    )
    // token and token id find next step
    if (!tokenInfo && !tokenInfo.id) return sendBadRequestWith406Code(res, message.tokenFormatInvalid)

    const userDetails = await UserModel.findOne({ _id: tokenInfo.id })

    // Admin Does not exist
    if (!userDetails) {
      return sendBadRequest(res, message.userNotFound)
    }
    if (tokenInfo.accessTokenId !== userDetails.access_token_id) return sendBadRequestWith406Code(res, message.invalidToken)

    const ProjectData = await ProjectModel.findOne({ admins: { $in: userDetails._id }, _id: req.params.projectId })
    if (!ProjectData) return sendBadRequest(res, message.youAreNotAdmin)
    // Attach Admin Info
    req.user = userDetails
    // next for using this method only
    next()
  } catch (e) {
    console.log(e)
    logger.error('IS_USER')
    if (String(e).includes('jwt expired')) {
      return sendBadRequestWith406Code(res, message.tokenExpiredError)
    } else if (String(e).includes('invalid token')) {
      return sendBadRequestWith406Code(res, message.invalidToken)
    } else if (String(e).includes('jwt malformed')) {
      return sendBadRequestWith406Code(res, message.invalidToken)
    }
    logger.error(e)
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}
