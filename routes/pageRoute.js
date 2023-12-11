import express from 'express'
import { createPage, deletePageData, getPageNameList, updatePageData } from '../controllers/pageController.js'
import { validationfield } from '../field_valodator/index.js'
import { check, param } from 'express-validator'
import message from '../utilities/messages/message.js'
import mongoose from 'mongoose'
import { isUser } from '../middleware/user_validator/validator.js'
import { isAdmin } from '../middleware/admin_validator/validator.js'
const router = express.Router()

// use for create page
router.post('/create/:projectId', [check('name').notEmpty().withMessage(message?.pageNameRequired), param('projectId').exists().withMessage(message?.pageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isAdmin, createPage)

// use for get all page name
router.get('/name/list/:projectId', [param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isUser, getPageNameList)

// use for soft delete page data
router.put('/update/:pageId/:projectId', [param('pageId').exists().withMessage(message?.pageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidPageId)
  }
  return true
}), param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isAdmin, updatePageData)

// use for delete page data
router.delete('/delete/:pageId/:projectId', [param('pageId').exists().withMessage(message?.pageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidPageId)
  }
  return true
}), param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isAdmin, deletePageData)

export default router
