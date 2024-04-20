import { app } from "./App.js";
import connectToDb from "./db/index.js";
import dotenv from 'dotenv'

dotenv.config({
    path : './.env'
})
    connectToDb().then(()=>{
        app.listen(process.env.PORT | 4000 ,()=>{
            console.log(`App is running on Port : ${process.env.PORT}`);
        })
    }).catch((error)=>{
        console.log("MongoDb conection failed, Error : ", error);
    })





// import mongoose from 'mongoose'
// import { DB_NAME } from './constants'
// import express from 'express'
// const app = express()
// //IIFE (Immediately Invoked Function Expressions)
// ( async () =>{
//     // rember used async-await and try-catch is considered as good practice to handle erros.
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         // app listen from express used for to make connect app with database
//         app.on('Error',(error)=>{
//             console.log("Error in connecting with app",error);
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`app is running at Port: ${process.env.PORT}`)
//         })
        
//     } catch (error) {
//         console.error("Error: ",error)
//         throw error
//     }
// } )()