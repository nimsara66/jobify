import express from 'express'
const app = express()

import dotenv from 'dotenv'
dotenv.config()

import morgan from 'morgan'
import 'express-async-errors'

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url))

import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'

// db and authentication
import connectDB from './db/connect.js'

// routers
import authRouter from './routes/authRoute.js'
import jobsRouter from './routes/jobsRoute.js'

// middleware
import notFoundMiddleware from './middleware/not-found.js'
import errorHandlerMiddeware from './middleware/error-handler.js'
import authenticateUser from './middleware/auth.js'

if (process.env.NODE_ENV !== 'Production') {
    app.use(morgan('dev'))
}

// only when production
app.use(express.static(path.resolve(__dirname, './client/build')))
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())

app.use(express.json())

// app.get('/', (req, res) => {
//     res.send('Welcome!')
// })

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

// only when production
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

app.use(notFoundMiddleware)
app.use(errorHandlerMiddeware)

const PORT = process.env.PORT || 5500

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}...`);
        })
    } catch (error) {
        console.log(error)
    }
}

start()