import { ProjectModel } from '../models/projectModels.js'
import { UserModel } from '../models/userModels.js'
import constant from '../utilities/constant.js'
import logger from '../utilities/logger.js'
import message from '../utilities/messages/message.js'
import { sendBadRequest, sendSuccess } from '../utilities/response/index.js'

// use for create project
export const createProject = async (req, res) => {
  try {
    const data = req.body

    const existProjectData = await ProjectModel.findOne({ name: data.name, admins: { $in: req.user._id } })
    if (existProjectData) return sendBadRequest(res, message.projectAlreadyExist)

    const projectData = new ProjectModel({
      name: data.name
    })

    projectData.admins.push(req.user._id)

    await projectData.save()
    await req.user.save()

    return sendSuccess(res, projectData, message.projectCreatedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('CREATE_PROJECT')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for update project
export const updateProject = async (req, res) => {
  try {
    const data = req.body
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)

    // if (!(projectData.admins.includes(req.user._id))) return sendBadRequest(res, message.enterValidProjectId)

    if (data.name) {
      const existProjectData = await ProjectModel.findOne({ name: data.name, admins: { $in: req.user._id } })
      if (existProjectData) return sendBadRequest(res, message.projectAlreadyExist)
      projectData.name = data.name
    }

    if (req.params.userId) {
      if (req.user._id.equals(req.params.userId)) return sendBadRequest(res, message.youCanNotModifyYourSelf)
    }

    if (data.role && (!constant.USER.includes(data.role))) return sendBadRequest(res, message.enterValidRole)

    if (req.params.userId && data.role === constant.USER[1]) {
      const userData = await UserModel.findOne({ _id: req.params.userId })
      // if (!userData) return sendBadRequest(res, message.userNotFound)
      if (!userData || !(projectData.admins.includes(req.params.userId))) return sendBadRequest(res, message.enterValidAdminId)
      projectData.members.push(req.params.userId)
      projectData.admins.pull(req.params.userId)
      await userData.save()
    }

    if (req.params.userId && data.role === constant.USER[0]) {
      const userData = await UserModel.findOne({ _id: req.params.userId })
      // if (!userData) return sendBadRequest(res, message.userNotFound)
      if (!userData || !(projectData.members.includes(req.params.userId))) return sendBadRequest(res, message.enterValidMemberId)
      projectData.members.pull(req.params.userId)
      projectData.admins.push(req.params.userId)
      await userData.save()
    }
    await projectData.save()
    return sendSuccess(res, projectData, message.projectDataUpdatedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('UPDATE_PROJECT')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get all project data
export const getProjectData = async (req, res) => {
  try {
    const options = {}
    if (req.query.name) {
      options.name = { $regex: req.query.name, $options: 'i' }
    } else {
      options.status = true
    }
    const projectData = await ProjectModel.find({ $or: [{ admins: { $in: req.user._id } }, { members: { $in: req.user._id } }] })

    return sendSuccess(res, projectData, message.projectDataGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_PROJECT_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use fpr  get project data by id
export const getProjectDataByID = async (req, res) => {
  try {
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)
    if (!(projectData.members.includes(req.user._id) || projectData.admins.includes(req.user._id))) return sendBadRequest(res, message.enterValidProjectId)
    return sendSuccess(res, projectData, message.pageDataGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_PROJECT_DATA_BY_ID')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for add user in project as a member or admin
export const referedProject = async (req, res) => {
  try {
    const data = req.body
    const userData = await UserModel.findOne({ email: data.email })
    if (!userData) {
      return sendBadRequest(res, message.enterValidEmailId)
    }
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)

    // if (!(projectData.admins.includes(req.user._id))) return sendBadRequest(res, message.enterValidProjectId)

    if (projectData.admins.includes(userData._id) || projectData.members.includes(userData._id)) return sendBadRequest(res, message.userIsAlreadyReferd)

    if (data.role === constant.USER[0]) {
      projectData.admins.push(userData._id)
    } else {
      projectData.members.push(userData._id)
    }
    await userData.save()
    await projectData.save()
    return sendSuccess(res, message.projectReferedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('REFERED_PROJECT_DATA')
  }
}

// use for delete project data
export const deleteProjectData = async (req, res) => {
  try {
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)
    // if (!(projectData.admins.includes(req.user._id))) return sendBadRequest(res, message.youCanNotRemoveProject)
    await projectData.delete()
    return sendSuccess(res, message.projectDataDeletedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('DELETE PROJECT DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get admin and member data according to project
export const getMemberAndAdminData = async (req, res) => {
  try {
    let projectData = await ProjectModel.findOne({ _id: req.params.projectId }).populate('members', '_id  username  email ').populate('admins', '_id  username email ').select({ members: 1, admins: 1 })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)
    projectData = JSON.parse(JSON.stringify(projectData))
    let arrayData = []
    if (projectData.members.length > 0) {
      for (const i of projectData.members) {
        i.role = 'MEMBER'
        arrayData.push(i)
      }
    }
    if (projectData.admins.length > 0) {
      for (const i of projectData.admins) {
        i.role = 'ADMIN'
        arrayData.push(i)
      }
    }
    arrayData = arrayData.filter(item => item.email !== req.user.email)
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)
    return sendSuccess(res, arrayData, message.memberAndAdminDataGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_ADMIN_AND_MEMBER')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get username and email by token
export const getNameAndEmail = async (req, res) => {
  try {
    const { email, username } = req.user
    return sendSuccess(res, { email, username }, message?.userDataGetSuccessfully)
    // const data = req.body.token
    // jwt.verify(data, config.USER_ACCESS_TOKEN, async (err, decoder) => {
    //   if (err) {
    //     return sendBadRequest(res, message?.invalidToken)
    //   }

    //   const userData = await UserModel.findOne({ _id: decoder?.id }, { email: 1, username: 1, access_token_id: 1 })

    //   if (!userData) return sendBadRequest(res, message?.userNotFound)

    //   if (userData.access_token_id !== decoder.accessTokenId) return sendBadRequest(res, message.invalidToken)

    //   const { email, username } = userData

    //   return sendSuccess(res, { email, username }, message?.userDataGetSuccessfully)
    // })
  } catch (e) {
    logger.error(e)
    logger.error('GET_EMAIL_AND_NAME')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get user role
export const getUserRole = async (req, res) => {
  try {
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)

    if (!(projectData.admins.includes(req.user._id) || projectData.members.includes(req.user._id))) return sendBadRequest(res, message.enterValidProjectId)

    let role
    if (projectData.admins.includes(req.user._id)) {
      role = 'ADMIN'
    } else {
      role = 'MEMBER'
    }

    return sendSuccess(res, { role }, message.roleGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_USER_ROLE')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}
