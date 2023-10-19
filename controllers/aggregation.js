import { websiteModels } from '../models/websiteModels.js'
import logger from '../utilities/logger.js'
import message from '../utilities/messages/message.js'
import { sendBadRequest, sendSuccess } from '../utilities/response/index.js'
import formidable from 'formidable'
// import { log } from "winston";

// export const getWebSiteDataByAggregation = async (req, res) => {
//     try {

//         const webSiteData = await websiteModels.findOne({ _id: req.params.websiteid })
//         for (let i = 0; i < webSiteData.pages.length; i++) {
//             const pageData = await pageModels.findOne({ _id: webSiteData.pages[i] })
//             if (pageData.keys.length > 0) {
//                 for (let i = 0; i < pageData.keys.length; i++) {
//                     const keyData = await pageModels.findOne({ _id: webSiteData.pages[i] })
//                     // console.log(keyData);
//                 }
//             }
//         }
//     } catch (e) {
//         logger.error(e)
//         logger.error("GET_WEBSITE_DATA")
//         return sendBadRequest(res, message.somethingGoneWrong)
//     }
// }

export const getWebSiteDataByAggregation = async (req, res) => {
  try {
    const webId = req.params.websiteId
    console.log(webId)
    console.log(req.params)

    const webSiteData = await websiteModels.findOne({ _id: webId, status: true }).populate({
      path: 'pages',

      match: { status: true },
      select: 'name',
      populate: {
        path: 'keys',
        match: { status: true },
        select: 'key language.value language.lg',
        populate: {
          path: 'language.lg',
          match: { status: true },
          select: 'name key'
        }
      }
    })
    console.log(webSiteData)

    const transformedData = {}

    webSiteData.pages.forEach((item) => {
      item.keys.forEach((key) => {
        key.language.forEach((language) => {
          const obj = {
            [item.name]: {
              [key.key]: language.value
            }
          }

          if (!transformedData[language.lg.key]) {
            transformedData[language.lg.key] = []
          }

          const existingItem = transformedData[language.lg.key].find((data) =>
            Object.keys(data)[0] === item.name
          )

          if (existingItem) {
            // Merge the objects if the key already exists
            existingItem[item.name] = { ...existingItem[item.name], ...obj[item.name] }
          } else {
            transformedData[language.lg.key].push(obj)
          }
        })
      })
    })

    return sendSuccess(res, transformedData)
  } catch (e) {
    console.log(e)
    logger.error(e)
    logger.error('GET_WEBSITE_DATA')
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}

export const formiddable = async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req)
    form.on('fileBegin', function (name, file) {
      file.path = __dirname + '/assets/' + file.name
    })
    form.on('file', function (name, file) {
      console.log('Upload file' + file.name)
    })
    res.sendFile(__dirname)
  } catch (e) {
    logger.error(e)
    return sendBadRequest(res, message.somethingGoneWrong)
  }
}
