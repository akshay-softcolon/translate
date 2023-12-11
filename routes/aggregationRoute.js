import express from 'express'
import { param } from 'express-validator'
import message from '../utilities/messages/message.js'
import { validationfield } from '../field_valodator/index.js'
import mongoose from 'mongoose'
import { getWebSiteDataByAggregation, getWebSiteDataByAggregations } from '../controllers/aggregation.js'
const router = express.Router()
// use for create website
// router.post('/create', [check('name').notEmpty().withMessage(message?.pageNameRequired)], validationfield, createWebsite)

// // use for get all website data
// router.get('/all-data', getAllWebsiteData)

// // use for get particluar website data
// router.get('/data', tokenVerify, getWebsiteData)

// // use for get website name
// router.get('/name/list', getWebsiteNameList)

// use for  get all website data by aggregation
router.get('/all/data/:projectId/:languageId', [param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
}), param('languageId').exists().withMessage(message?.languageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidLanguageId)
  }
  return true
})], validationfield, getWebSiteDataByAggregation)

router.get('/allsss/datasss/:projectId/:languageId', [param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
}), param('languageId').exists().withMessage(message?.languageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidLanguageId)
  }
  return true
})], validationfield, getWebSiteDataByAggregations)
// use for update websitedata
export default router
