import { KeyModel } from '../models/keyModels.js'
import { LanguageModels } from '../models/languageModels.js'
import { PageModels } from '../models/pageModels.js'
import { ProjectModel } from '../models/projectModels.js'
import logger from '../utilities/logger.js'
import message from '../utilities/messages/message.js'
import { sendBadRequest, sendSuccess } from '../utilities/response/index.js'

// use for create language key
export const createLanguageKey = async (req, res) => {
  try {
    const data = req.body
    const regex = /^[A-Z_ ]+$/
    if (!(regex.test(data.key))) {
      return sendBadRequest(res, message.enterNameAccordingToFormate)
    }

    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })

    if (!(projectData.pages.includes(req.params.pageId))) return sendBadRequest(res, message.enterValidPageId)

    const pageData = await PageModels.findOne({ _id: req.params.pageId })
    if (!pageData) return sendBadRequest(res, message.pageDataNotFound)

    if (pageData.status === false) return sendBadRequest(res, message.pageIsNotLongerExist)

    for (let i = 0; i < pageData.keys.length; i++) {
      const keyData = await KeyModel.findOne({ _id: pageData.keys[i] })
      if (!keyData) {
        await pageData.keys.pull(pageData.keys[i])
        return
      }
      if (keyData.key === data.key) {
        return sendBadRequest(res, message.keyDataAlreadyExist)
      }
    }

    const arrayData = []
    if (!data.language.length > 0) return sendBadRequest(res, message.languageIdAndValueIsRequired)
    for (let i = 0; i < data.language.length; i++) {
      if (!projectData.languages.includes(data.language[i].lg)) {
        return sendBadRequest(res, message.enterValidLanguageId)
      }
      const languageData = await LanguageModels.findOne({ _id: data.language[i].lg })
      if (!languageData) {
        return sendBadRequest(res, message.languageDataNotFound)
      }

      if (languageData.status === true) {
        arrayData.push({ lg: languageData._id, value: data.language[i].value })
      }
    }
    const createKey = await new KeyModel({
      key: data.key,
      detail: data.detail,
      language: arrayData,
      page_id: pageData._id
    })
    pageData.keys.push(createKey._id)

    await createKey.save()
    await pageData.save()
    return sendSuccess(res, createKey, message.keyCreatedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('CREATE_KEY')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get all key according to page particlular page id
export const getAllKeyDataByPageId = async (req, res) => {
  try {
    const projectData = await ProjectModel.findOne({ $or: [{ members: { $in: req.user._id } }, { admins: { $in: req.user._id } }], _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)

    if (!(projectData.pages.includes(req.params.pageId))) return sendBadRequest(res, message.enterValidPageId)

    const options = {}
    options.page_id = req.params.pageId
    if (req.query.status) {
      options.status = req.query.status
    }

    const keyData = await KeyModel.find(options).sort({ createdAt: -1 })
    if (!keyData) {
      return sendBadRequest(res, message.keyDataNotFound)
    }
    return sendSuccess(res, keyData, message.keyDataGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_WEBSITE_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for update key data
export const updateKeyData = async (req, res) => {
  try {
    console.log(req.body)
    console.log(req.params)
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })

    if (!(projectData.pages.includes(req.params.pageId))) return sendBadRequest(res, message.enterValidPageId)

    const data = req.body

    const keyData = await KeyModel.findOne({ _id: req.params.keyId })
    if (!keyData) return sendBadRequest(res, message.keyDataNotFound)

    if (data.key) {
      const regex = /^[A-Z_ ]+$/
      if (!regex.test(data.key)) {
        return sendBadRequest(res, message.enterNameAccordingToFormate)
      }
      keyData.key = data.key
    }

    if (data.language.length > 0) {
      for (let i = 0; i < data.language.length; i++) {
        if (!projectData.languages.includes(data.language[i].lg)) {
          return sendBadRequest(res, message.enterValidLanguageId)
        }
        const languageData = await LanguageModels.findOne({ _id: data.language[i].lg })
        if (!languageData) {
          return sendBadRequest(res, message.languageDataNotFound)
        }
        for (let i = 0; i < keyData.language.length; i++) {
          if (!keyData.language[i].lg.equals(languageData._id)) return sendBadRequest(res, message.enterValidLanguageId)
        }
        if (languageData && languageData.status === true) {
          for (let k = 0; k < keyData.language.length; k++) {
            if (languageData._id.equals(keyData.language[k].lg)) {
              keyData.language[k].value = data.language[i].value
            }
          }
        }
      }
    }

    if (data.oldpageid && data.newpageid) {
      const oldPageData = await PageModels.findOne({ _id: data.oldpageid })
      if (!oldPageData) {
        return sendBadRequest(res, message.oldPageDataNotFound)
      }
      if (!oldPageData.keys.includes(keyData._id)) {
        return sendBadRequest(res, message.enterValidPageId)
      }
      const newPageData = await PageModels.findOne({ _id: data.newpageid })
      if (!newPageData) {
        return sendBadRequest(res, message.newPageDataNotFound)
      }
      keyData.page_id = newPageData._id
      await oldPageData.keys.pull(keyData._id)
      await newPageData.keys.push(keyData._id)
      await oldPageData.save()
      await newPageData.save()
    }

    if (data.detail) {
      keyData.detail = data.detail
    }
    await keyData.save()
    return sendSuccess(res, keyData, message.keyDataUpdatedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('UPDATE_KEY_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for delete key data
export const deleteKeyData = async (req, res) => {
  try {
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })

    if (!(projectData.pages.includes(req.params.pageId))) return sendBadRequest(res, message.enterValidPageId)

    const keyData = await KeyModel.findOne({ _id: req.params.keyId, page_id: req.params.pageId })
    if (!keyData) return sendBadRequest(res, message.enterValidKeyId)

    const pageData = await PageModels.findOne({ keys: { $in: keyData._id } })
    if (pageData) return sendBadRequest(res, message.keyAlreadyInUse)

    await pageData.keys.pull(keyData._id)
    await keyData.delete()
    await pageData.save()
    return sendSuccess(res, message.keyDataDeletedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('DELETE_KEY_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}
// const url = 'wss://openfeed.5paisa.com/Feeds/api/chat?Value1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjUwMzIyNzU5Iiwicm9sZSI6IjIwMTA5IiwiU3RhdGUiOiIiLCJSZWRpcmVjdFNlcnZlciI6IkMiLCJuYmYiOjE3MDIwMDc3NzYsImV4cCI6MTcwMjA2MDE5OSwiaWF0IjoxNzAyMDA3Nzc2fQ.gYJpcmc-RSa6wh0EqNSXnV6Z4LWkQ4XCBDnpdH9l5-g|50322759'
// const ws = new WebSocket(`${url}`)

// ws.on('error', console.error)

// ws.on('open', function open () {
//   console.log('connected')
//   const msg = {
//     Method: 'MarketFeedV3',
//     Operation: 'Subscribe',
//     ClientCode: '50322759',
//     MarketFeedData: [{ Exch: 'N', ExchType: 'C', ScripCode: 15083 }]
//   }

//   ws.send(JSON.stringify(msg))
//   // ws.send(Date.now())
// })

// ws.on('close', function close () {
//   console.log('disconnected')
// })

// ws.on('message', function message (data) {
//   console.log(data)
//   console.log(`Round-trip time: ${Date.now() - data} ms`)

//   setTimeout(function timeout () {
//     ws.send(Date.now())
//   }, 500)
// })
