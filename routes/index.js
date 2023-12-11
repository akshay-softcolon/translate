import express from 'express'
import healthRoute from './health/index.js'
import languageRouter from '../routes/languageRoute.js'
import pageRouter from '../routes/pageRoute.js'
import aggregationRouter from '../routes/aggregationRoute.js'
import authRouter from '../routes/authRoute.js'
import keyRouter from '../routes/keyRoute.js'
import projectRouter from '../routes/projectRoute.js'

const router = express.Router()

/* GET home page. */

// like router use like this
router.use('/health', healthRoute)
router.use('/auth', authRouter)
router.use('/aggregation', aggregationRouter)
router.use('/page', pageRouter)
router.use('/language', languageRouter)
router.use('/key', keyRouter)
router.use('/project', projectRouter)

export default router
