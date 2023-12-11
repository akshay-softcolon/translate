import express from 'express'
import { createProject, deleteProjectData, getMemberAndAdminData, getNameAndEmail, getProjectData, getProjectDataByID, getUserRole, referedProject, updateProject } from '../controllers/projectController.js'
import message from '../utilities/messages/message.js'
import { check, param } from 'express-validator'
import { isUser } from '../middleware/user_validator/validator.js'
import { validationfield } from '../field_valodator/index.js'
import mongoose from 'mongoose'
import { isAdmin } from '../middleware/admin_validator/validator.js'
const route = express.Router()

route.post('/create-project', [check('name').notEmpty().withMessage(message?.nameRequired)], validationfield, isUser, createProject)

route.post('/referd-user/:projectId', [check('role').notEmpty().withMessage(message?.roleIsRequired), check('email').notEmpty().withMessage(message?.emailMustBeRequired), param('projectId').notEmpty().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isAdmin, referedProject)

route.get('/all-project-data', isUser, getProjectData)

route.get('/member-admin-data/:projectId', [param('projectId').notEmpty().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isUser, getMemberAndAdminData)

route.get('/project-data/:projectId', [param('projectId').notEmpty().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isUser, getProjectDataByID)

route.get('/user-name-email', isUser, getNameAndEmail)

route.get('/user-role/:projectId', [param('projectId').notEmpty().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isUser, getUserRole)

route.put('/update-project-data/:projectId/:userId', [param('projectId').notEmpty().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
}), param('userId').notEmpty().withMessage(message?.userIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidUserId)
  }
  return true
})], validationfield, isAdmin, updateProject)

route.delete('/remove-project-data/:projectId', [param('projectId').notEmpty().withMessage(message?.projectIdIsRequired).custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(message.enterValidProjectId)
  }
  return true
})], validationfield, isAdmin, deleteProjectData)

export default route
