import { LanguageModels } from '../models/languageModels.js'
import { PageModels } from '../models/pageModels.js'
import { WebsiteModels } from '../models/websiteModels.js'
import logger from '../utilities/logger.js'
import message from '../utilities/messages/message.js'
import { sendBadRequest, sendSuccess } from '../utilities/response/index.js'

// use for add language
export const addLanguage = async (req, res) => {
  try {
    const data = req.body
    const websiteData = await WebsiteModels.findOne({ _id: req.website._id })
    if (!websiteData) {
      return sendBadRequest(res, message.websiteDataNotFound)
    }
    for (let i = 0; i < websiteData.languages.length; i++) {
      const languageData = await LanguageModels.findOne({ _id: websiteData.languages[i] }).select({ name: 1 })
      if (languageData.name.toLowerCase() === data.name.toLowerCase()) {
        return sendBadRequest(res, message.languageDataAlreadyExist)
      }
    }
    const addLanguage = await new LanguageModels({
      name: data.name.toLowerCase(),
      key: data.key,
      wesite_id: websiteData._id
    })
    await websiteData.languages.push(addLanguage._id)
    await addLanguage.save()
    await websiteData.save()
    return sendSuccess(res, addLanguage, message.languageAddedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('ADD_LANGUAGE')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get all language data
export const getAllLanguageData = async (req, res) => {
  try {
    const options = {}
    options._id = { $in: req.website.languages }
    if (req.query.status) {
      options.status = req.query.status
    } else {
      options.status = true
    }

    const languageData = await LanguageModels.find(options).sort({ createdAt: -1 })

    if (!languageData) {
      return sendBadRequest(res, message.languageDataNotFound)
    }
    return sendSuccess(res, languageData, message.languageDataGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_ALL_LANGUAGE_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get language name data
export const getLanguageNameList = async (req, res) => {
  try {
    const options = {}
    options._id = { $in: req.website.languages }
    if (req.query.status) {
      options.status = req.query.status
    } else {
      options.status = true
    }

    const languageData = await LanguageModels.find(options).select({ name: 1 }).sort({ createdAt: -1 })

    if (!languageData) {
      return sendBadRequest(res, message.languageDataNotFound)
    }
    return sendSuccess(res, languageData, message.languageDataGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_LANGUAGE_NAME_LIST')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get language data
export const getLanguageData = async (req, res) => {
  try {
    const languageData = await LanguageModels.findOne({ _id: req.params.languageId }).sort({ createdAt: -1 })

    if (!languageData) {
      return sendBadRequest(res, message.languageDataNotFound)
    }
    return sendSuccess(res, languageData, message.languageDataGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_LANGUAGE_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for update language data
export const updateLanguageData = async (req, res) => {
  try {
    const data = req.body

    const languageData = await LanguageModels.findOne({ _id: req.params.languageId })

    if (!languageData) {
      return sendBadRequest(res, message.languageDataNotFound)
    }
    if (languageData.status === false) {
      return sendBadRequest(res, message.languageDataIsDeleted)
    }
    if (data.name) {
      for (let i = 0; i < req.website.languages.length; i++) {
        const existLanguageData = await LanguageModels.findOne({ _id: req.website.languages[i] }).select({ name: 1 })
        if (existLanguageData.name.toLowerCase() === data.name.toLowerCase()) {
          return sendBadRequest(res, message.languageDataAlreadyExist)
        }
      }

      languageData.name = data.name.toLowerCase()
    }

    await languageData.save()
    return sendSuccess(res, message.languageDataUpdatedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('UPDATE_LANGUAGE_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for soft delete language data
export const deleteLanguageData = async (req, res) => {
  try {
    const languageData = await LanguageModels.findOne({ _id: req.params._id })
    if (!languageData) {
      return sendBadRequest(res, message.pageDataNotFound)
    }
    if (languageData.status === false) {
      return sendBadRequest(res, message.languageDataAlreadyDeleted)
    }
    if (req.website.languages.length > 0) {
      return sendBadRequest(res, message.languageDataAlreadyInUse)
    }

    await req.website.languages.pull(languageData._id)
    await languageData.delete()
    return sendSuccess(res, message.languageDataDeletedSuucessfully)
  } catch (e) {
    logger.error(e)
    logger.error('DELETE_LANGUAGE_DATA')
  }
}
