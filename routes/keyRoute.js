import express from "express"
import { createLanguageKey, deleteKeyData, getAllKeyData, getAllKeyDataByPageId, getKeyDataByKeyId, updateKeyData } from "../controllers/keyController.js"
import message from "../utilities/messages/message.js"
import { validationfield } from "../field_valodator/index.js"
import { param } from "express-validator"
import { tokenVerify } from "../middleware/isWebsite.js"
const router = express.Router()

// use for create language key
router.post("/create/:pageid", [param('pageid').notEmpty().withMessage(message?.pageIdRequired)], validationfield, tokenVerify, createLanguageKey)


// use for get all key data 
router.get("/data", tokenVerify, getAllKeyData)


// use for get key data of particular language
// router.get("/:languageid", [param('languageid').notEmpty().withMessage(message?.languageIdRequired)], validationfield, tokenVerify, getKeyData)


// use for get key data by keyid
// router.get("/data/:keyid", [param('keyid').notEmpty().withMessage(message?.keyIdRequired)], validationfield, tokenVerify, getKeyDataByKeyId)



// use for get key data by keyid
router.get("/data/:pageid", [param('pageid').notEmpty().withMessage(message?.pageIdRequired)], validationfield, tokenVerify, getAllKeyDataByPageId)



// use for get key data by keyid
router.put("/update/:keyid", [param('keyid').notEmpty().withMessage(message?.keyIdRequired)], validationfield, tokenVerify, updateKeyData)


// use for delete key data by keyid
router.delete("/delete/:keyid", [param('keyid').notEmpty().withMessage(message?.keyIdRequired)], validationfield, tokenVerify, deleteKeyData)

export default router