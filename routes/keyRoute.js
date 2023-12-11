import express from 'express'
import { createLanguageKey, deleteKeyData, getAllKeyDataByPageId, updateKeyData } from '../controllers/keyController.js'
import message from '../utilities/messages/message.js'
import { validationfield } from '../field_valodator/index.js'
import { check, param } from 'express-validator'
import mongoose from 'mongoose'
import { isUser } from '../middleware/user_validator/validator.js'
import { isAdmin } from '../middleware/admin_validator/validator.js'
const router = express.Router()

// use for create language key
router.post('/create/:projectId/:pageId', [param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
}), param('pageId').exists().withMessage(message?.pageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidPageId)
  }
  return true
}), check('detail').exists().withMessage(message?.detailIsRequired), check('key').exists().withMessage(message?.keyIsRequired)

], validationfield, isAdmin, createLanguageKey)

// use for get key data by pageid
router.get('/:projectId/:pageId', [param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
}), param('pageId').exists().withMessage(message?.pageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidPageId)
  }
  return true
})], validationfield, isUser, getAllKeyDataByPageId)

// use for get key data by keyid
router.put('/update/:projectId/:pageId/:keyId', [param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
}), param('pageId').exists().withMessage(message?.pageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidPageId)
  }
  return true
}), param('keyId').exists().withMessage(message?.keyIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidKeyId)
  }
  return true
})], validationfield, isAdmin, updateKeyData)

// use for delete key data by keyid
router.delete('/delete/:projectId/:pageId/:keyId', [param('projectId').exists().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
}), param('pageId').exists().withMessage(message?.pageIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidPageId)
  }
  return true
}), param('keyId').exists().withMessage(message?.keyIdRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidKeyId)
  }
  return true
})], validationfield, isAdmin, deleteKeyData)

export default router
