import express from 'express'
import cors from 'cors' 
import cookieParser from 'cookie-parser'
const app = express()

// app.use mostly use for do configuration or add middleware
// CROS (Cross Origin Resourse Sharing) can be used alone but giving origin and others is good prc
app.use(cors({
    origin : process.env.CORS_ORIGIN
}))
// cookie parser mostly used as this
app.use(cookieParser())
// express.js also provide configuration here are the some imp 
app.use(express.json({limit : '24kb'}))
app.use(express.urlencoded({extended:true , limit : '24kb'}))
// give any name i give public bcz i made public named folder from image & favicon.
app.use(express.static('public'))


//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use('/api/v1/users',userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// http://localhost:8000/api/v1/users/register

export { app }