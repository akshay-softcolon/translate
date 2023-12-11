import { LanguageModels } from '../models/languageModels.js'
import { ProjectModel } from '../models/projectModels.js'
import logger from '../utilities/logger.js'
import message from '../utilities/messages/message.js'
import { sendBadRequest, sendSuccess } from '../utilities/response/index.js'

// use for add language
export const addLanguage = async (req, res) => {
  try {
    const data = req.body
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)

    // if (!(projectData.admins.includes(req.user._id))) return sendBadRequest(res, message.youAreNotAdmin)

    if (projectData.languages.length > 0) {
      for (let i = 0; i < projectData.languages.length; i++) {
        const languageData = await LanguageModels.findOne({ _id: projectData.languages[i] })
        if (!languageData) return sendBadRequest(res, message.languageDataNotFound)
        if (languageData.name === data.name.toLowerCase()) return sendBadRequest(res, message.languageDataAlreadyExist)
        if (languageData.code === data.code) return sendBadRequest(res, message.languageCodeMustBeUnique)
      }
    }
    const addLanguage = await new LanguageModels({
      name: data.name.toLowerCase(),
      code: data.code
    })
    await projectData.languages.push(addLanguage._id)
    await addLanguage.save()
    await projectData.save()
    return sendSuccess(res, addLanguage, message.languageAddedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('ADD_LANGUAGE')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get language name data
export const getLanguageNameList = async (req, res) => {
  try {
    const projectData = await ProjectModel.findOne({ $or: [{ members: { $in: req.user._id } }, { admins: { $in: req.user._id } }], _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.enterValidProjectId)

    const options = {}
    options._id = req.params.projectId
    if (req.query.status) {
      options.status = req.query.status
    } else {
      options.status = true
    }

    const languageData = await ProjectModel.findOne(options).populate('languages', 'name code _id').select({ languages: 1 })

    return sendSuccess(res, languageData, message.languageDataGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_LANGUAGE_NAME_LIST')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for update language data
export const updateLanguageData = async (req, res) => {
  try {
    const data = req.body

    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })

    const languageData = await LanguageModels.findOne({ _id: req.params.languageId })
    if (!languageData) return sendBadRequest(res, message.languageDataNotFound)

    if (!(projectData.languages.includes(languageData._id))) return sendBadRequest(res, message.enterValidLanguageId)

    if (data.name) {
      for (const i of projectData.languages) {
        const languageData = await LanguageModels.findOne({ name: data.name.toLowerCase(), _id: i })
        if (languageData) return sendBadRequest(res, message.languageDataAlreadyExist)
      }
      languageData.name = data.name.toLowerCase()
    }
    if (data.code) {
      for (const i of projectData.languages) {
        const languageData = await LanguageModels.findOne({ code: data.code, _id: i })
        if (languageData) return sendBadRequest(res, message.languageCodeMustBeUnique)
      }
      languageData.code = data.code
    }

    await languageData.save()
    return sendSuccess(res, message.languageDataUpdatedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('UPDATE_LANGUAGE_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for delete language data
export const deleteLanguageData = async (req, res) => {
  try {
    const languageData = await LanguageModels.findOne({ _id: req.params.languageId })
    if (!languageData) {
      return sendBadRequest(res, message.languageDataNotFound)
    }
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)

    // if (!(projectData.admins.includes(req.user._id))) return sendBadRequest(res, message.youAreNotAdmin)
    if (!(projectData.languages.includes(languageData._id))) return sendBadRequest(res, message.enterValidProjectId)
    await projectData.languages.pull(languageData._id)
    await languageData.delete()
    await projectData.save()
    return sendSuccess(res, message.languageDataDeletedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('DELETE_LANGUAGE_DATA')
  }
}
