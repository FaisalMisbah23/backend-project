import express from 'express'
import cors from 'cors' 
import cookieParser from 'cookie-parser'
const app = express()

// app.use mostly use for do configuration or add middleware
// CROS (Cross Origin Resourse Sharing) can be used alone but givine origin and others is good prc
app.use(cors({
    origin : process.env.CORS_ORIGIN
}))
// cookie parser mostly used as this
app.use(cookieParser())
// express.js also provide configuration here are the some imp 
app.use(express.json({limit : '24kb'}))
app.use(express.urlencoded({extended:true , limit : '24kb'}))
// give any name i give public bcz i made public named folder fro image & favicon.
app.use(express.static('public'))


export {app}