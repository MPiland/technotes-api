import express from 'express'
import { login, refresh, logout } from '../controllers/authController.js'
import loginLimiter from '../middleware/loginLimiter.js'

const router = express()

router.route('/').post(loginLimiter, login)

router.route('/refresh').get(refresh)

router.route('/logout').post(logout)

export default router
