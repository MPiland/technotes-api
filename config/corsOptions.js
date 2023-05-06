import allowedOrigins from './allowedOrigins.js'

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(req.header('Origin')) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },

  credentials: true,
  optionsSuccessStatus: 200,
}

export default corsOptions
