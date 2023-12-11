import express from 'express'
import { addLanguage, deleteLanguageData, getLanguageNameList, updateLanguageData } from '../controllers/languageController.js'
import { validationfield } from '../field_valodator/index.js'
import { check, param } from 'express-validator'
import message from '../utilities/messages/message.js'
import mongoose from 'mongoose'
import { isUser } from '../middleware/user_validator/validator.js'
import { isAdmin } from '../middleware/admin_validator/validator.js'
const router = express.Router()

// use for add language
router.post('/add/:projectId', [param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
}), check('name').notEmpty().withMessage(message?.languageNameRequired)], validationfield, isAdmin, addLanguage)

// use for get language name list
router.get('/name/list/:projectId', isUser, getLanguageNameList)

// use for delete language data
router.put('/update/:languageId/:projectId', [param('languageId').exists().withMessage(message?.languageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidLanguageId)
  }
  return true
}), param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isAdmin, updateLanguageData)

// use for delete language data
router.delete('/delete/:languageId/:projectId', [param('languageId').exists().withMessage(message?.languageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidLanguageId)
  }
  return true
}), param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isAdmin, deleteLanguageData)

export default router
