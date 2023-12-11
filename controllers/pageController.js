import { PageModels } from '../models/pageModels.js'
import { ProjectModel } from '../models/projectModels.js'
import logger from '../utilities/logger.js'
import message from '../utilities/messages/message.js'
import { sendBadRequest, sendSuccess } from '../utilities/response/index.js'

// use for create page
export const createPage = async (req, res) => {
  try {
    const data = req.body
    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)

    // if (!(projectData.admins.includes(req.user._id))) return sendBadRequest(res, message.youAreNotAdmin)

    if (projectData.pages.length > 0) {
      for (let i = 0; i < projectData.pages.length; i++) {
        const project = await PageModels.findOne({ _id: projectData.pages[i] })
        if (!project) return sendBadRequest(res, message.pageDataNotFound)
        if (project.name === data.name.toLowerCase()) return sendBadRequest(res, message.pageDataAlReadyExist)
      }
    }
    const addPage = await new PageModels({
      name: data.name.toLowerCase()
    })
    projectData.pages.push(addPage._id)
    await addPage.save()
    await projectData.save()
    return sendSuccess(res, addPage, message.pageCreatedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('CREATE_PAGE')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for get page name list
export const getPageNameList = async (req, res) => {
  try {
    const projectData = await ProjectModel.findOne({ $or: [{ members: { $in: req.user._id } }, { admins: { $in: req.user._id } }], _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)
    const option = {}
    option.status = true
    option._id = req.params.projectId
    if (req.query.status) {
      option.status = req.query.status
    }
    const pageData = await ProjectModel.findOne(option).populate('pages', 'name _id').select({ pages: 1 }).sort({ createdAt: -1 })

    return sendSuccess(res, pageData, message.pageDataGetSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('GET_PAGE_NAME_LIST')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for update page data
export const updatePageData = async (req, res) => {
  try {
    const data = req.body

    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.youAreNotAdmin)

    const pageData = await PageModels.findOne({ _id: req.params.pageId })
    if (!pageData) return sendBadRequest(res, message.pageDataNotFound)

    if (!(projectData.pages.includes(pageData._id))) return sendBadRequest(res, message.enterValidPageId)

    if (data.name) {
      for (const i of projectData.pages) {
        const existPageData = await PageModels.findOne({ name: data.name.toLowerCase(), _id: i })
        if (existPageData) return sendBadRequest(res, message.pageDataAlReadyExist)
      }
      pageData.name = data.name.toLowerCase()
    }
    await pageData.save()
    return sendSuccess(res, pageData, message.pageDataUpdatedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('UPDATE_PAGE_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

// use for soft delete page data
export const deletePageData = async (req, res) => {
  try {
    const pageData = await PageModels.findOne({ _id: req.params.pageId })
    if (!pageData) {
      return sendBadRequest(res, message.pageDataNotFound)
    }

    const projectData = await ProjectModel.findOne({ _id: req.params.projectId })
    if (!projectData) return sendBadRequest(res, message.projectDataNotFound)

    if (!(projectData.pages.includes(pageData._id))) return sendBadRequest(res, message.enterValidProjectId)
    // if (!(projectData.admins.includes(req.user._id))) return sendBadRequest(res, message.youAreNotAdmin)

    await projectData.pages.pull(pageData._id)
    await pageData.delete()
    await projectData.save()
    return sendSuccess(res, message.pageDataDeletedSuccessfully)
  } catch (e) {
    logger.error(e)
    logger.error('DELETE_PAGE_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}
