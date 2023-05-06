import { rateLimit } from 'express-rate-limit'
import { logEvents } from './logger.js'

const loginLimiter = rateLimit({
  windowsMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login requets per 'window' per minute
  message: {
    message:
      'Too many login attemps from thi IP, please try again after a 60 second pause',
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      'error.log'
    )
    res.status(options.statusCode).send(options.message)
  },
  standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
  legacyHeaders: false, // Disable the 'X-RateLimit-*' headers
})

export default loginLimiter
