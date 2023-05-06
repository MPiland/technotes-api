import dotenv from 'dotenv'
import 'express-async-errors'
import express from 'express'
import path from 'path'
import { logger, logEvents } from './middleware/logger.js'
import errorHandler from './middleware/errorHandler.js'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import cors from 'cors'
import corsOptions from './config/corsOptions.js'
import connectDB from './config/dbConn.js'
import mongoose from 'mongoose'

import rootRouter from './routes/root.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import noteRouter from './routes/noteRoutes.js'

dotenv.config()

console.log(process.env.NODE_ENV)

connectDB()

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3500

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', rootRouter)
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/notes', noteRouter)

app.all('*', (req, res) => {
  res.status(404)
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' })
  } else {
    res.type('txt').send('404 Not Found')
  }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log(`Server running on ${PORT}`))
})

mongoose.connection.on('error', (err) => {
  console.log(err)
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log'
  )
})
