import { keyModel } from "../models/keyModels.js";
import { languageModels } from "../models/languageModels.js";
import { pageModels } from "../models/pageModels.js";
import { websiteModels } from "../models/websiteModels.js";
import logger from "../utilities/logger.js";
import message from "../utilities/messages/message.js";
import { sendBadRequest, sendSuccess } from "../utilities/response/index.js";


// use for create language key
export const createLanguageKey = async (req, res) => {
    try {
        const data = req.body
        const pageData = await pageModels.findOne({ _id: req.params.pageid })
        if (!pageData) return sendBadRequest(res, message.pageDataNotFound)
        if (pageData.status === false) {
            return sendBadRequest(res, message.pageIsNotLongerExist)
        }
        for (let i = 0; i < pageData.keys.length; i++) {
            const keyData = await keyModel.findOne({ _id: pageData.keys[i] })
            if (keyData.key.toLowerCase() === data.key.toLowerCase()) {
                return sendBadRequest(res, message.keyDataAlreadyExist)
            }
        }
        let arrayData = []
        for (let i = 0; i < data.language.length; i++) {
            const languageData = await languageModels.findOne({ _id: data.language[i].lg })
            if (!languageData) {
                return sendBadRequest(res, message.languageDataNotFound)
            }
            if (languageData.status === true) {
                arrayData.push({ lg: languageData._id, value: data.language[i].value })
            }
        }
        let createKey = await new keyModel({
            key: data.key,
            language: arrayData,
            page_id: pageData._id
        })
        pageData.keys.push(createKey._id)

        await createKey.save()
        await pageData.save()
        return sendSuccess(res, createKey, message.keyCreatedSuccessfully)
    } catch (e) {
        logger.error(e)
        logger.error('CREATE_WEBSITE')
        return sendBadRequest(res, message.somethingGoneWrong)
    }
}


// //use for get all key of particular language
// export const getKeyData = async (req, res) => {
//     try {
//         const options = {}
//         options.language = { $in: req.params.languageid }
//         if (req.query.status) {
//             options.status = req.query.status
//         }
//         const keyData = await keyModel.find(options).select({ name: 1 })
//         if (!keyData) {
//             return sendBadRequest(res, message.keyDataNotFound)
//         }
//         return sendSuccess(res, keyData, message.keyDataGetSuccessfully)
//     } catch (e) {
//         logger.error(e)
//         logger.error("GET_WEBSITE_DATA")
//         return sendBadRequest(res, message.somethingGoneWrong)
//     }
// }


//use for get all key according to page
export const getAllKeyData = async (req, res) => {
    try {
        const options = {}
        options.page_id = { $in: req.website.pages }
        if (req.query.status) {
            options.status = req.query.status
        }
        const languageData = await keyModel.find(options)
        if (!languageData) {
            return sendBadRequest(res, message.languageDataNotFound)
        }
        return sendSuccess(res, languageData, message.languageDataGetSuccessfully)
    } catch (e) {
        logger.error(e)
        logger.error("GET_WEBSITE_DATA")
        return sendBadRequest(res, message.somethingGoneWrong)
    }
}



//use for get all key according to page particlular page id
export const getAllKeyDataByPageId = async (req, res) => {
    try {
        const options = {}
        options.page_id = req.params.pageid
        if (req.query.status) {
            options.status = req.query.status
        }
        const keyData = await keyModel.find(options)
        if (!keyData) {
            return sendBadRequest(res, message.keyDataNotFound)
        }
        return sendSuccess(res, keyData, message.keyDataGetSuccessfully)
    } catch (e) {
        logger.error(e)
        logger.error("GET_WEBSITE_DATA")
        return sendBadRequest(res, message.somethingGoneWrong)
    }
}

//use for get all key by keyid
export const getKeyDataByKeyId = async (req, res) => {
    try {
        const options = {}
        if (req.query.status) {
            options.status = req.query.status
        }
        const keyData = await keyModel.find({ _id: req.params.keyid }).select({ name: 1 })
        if (!keyData) {
            return sendBadRequest(res, message.keyDataNotFound)
        }
        if (!req.website.pages.includes(keyData._id)) {
            return sendBadRequest(res, message.enterValidKeyId)
        }

        return sendSuccess(res, keyData, message.keyDataGetSuccessfully)
    } catch (e) {
        logger.error(e)
        logger.error("GET_WEBSITE_DATA")
        return sendBadRequest(res, message.somethingGoneWrong)
    }
}


//use for update key data
export const updateKeyData = async (req, res) => {
    try {
        const data = req.body
        let keyData = await keyModel.findOne({ _id: req.params.keyid })
        if (!keyData) {
            return sendBadRequest(res, message.keyDataNotFound)
        }

        if (!req.website.pages.includes(keyData.page_id)) {
            return sendBadRequest(res, message.pageDataNotFound)
        }

        if (data.language) {
            for (let i = 0; i < data.language.length; i++) {
                const languageData = await languageModels.findOne({ _id: data.language[i].lg })
                if (!languageData) {
                    return sendBadRequest(res, message.languageDataNotFound)
                }
                for (let i = 0; i < keyData.language.length; i++) {
                    if (!keyData.language[i].lg.equals(languageData._id)) return sendBadRequest(res, message.languageDataNotFound)
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
            let oldPageData = await pageModels.findOne({ _id: data.oldpageid })
            if (!oldPageData) {
                return sendBadRequest(res, message.oldPageDataNotFound)
            }
            if (!oldPageData.keys.includes(keyData._id)) {
                return sendBadRequest(res, message.enterValidPageId)
            }
            let newPageData = await pageModels.findOne({ _id: data.newpageid })
            if (!newPageData) {
                return sendBadRequest(res, message.newPageDataNotFound)
            }
            await oldPageData.keys.pull(keyData._id)
            await newPageData.keys.push(keyData._id)
            await oldPageData.save()
            await newPageData.save()
        }

        await keyData.save()
        return sendSuccess(res, keyData, message.keyDataUpdatedSuccessfully)
    } catch (e) {
        logger.error(e)
        logger.error("UPDATE_KEY_DATA")
        return sendBadRequest(res, message.somethingGoneWrong)
    }
}


//use for delete key data
export const deleteKeyData = async (req, res) => {
    try {
        const keyData = await keyModel.findOne({ _id: req.params.keyid })
        if (!keyData) {
            return sendBadRequest(res, message.keyDataNotFound)
        }

        if (!req.website.pages.includes(keyData.page_id)) {
            return sendBadRequest(res, message.pageDataNotFound)
        }
        await pageData.keys.pull(keyData._id)
        await keyData.delete()
        await pageData.save()
        return sendSuccess(res, message.keyDataDeletedSuccessfully)
    } catch (e) {
        logger.error(e)
        logger.error("DELETE_KEY_DATA")
        return sendBadRequest(res, message.somethingGoneWrong)
    }
}