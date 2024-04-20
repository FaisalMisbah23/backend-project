import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectToDb = async () => {
    // used async-await & try-catch for best practices
    try {
        const connectionResponse = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`Connected to Mongodb, Database Name : ${DB_NAME}, Host Name : ${connectionResponse.connection.host}`)
    } catch (error) {
        console.log("Error white connecting to MongoDB: " , error);
        // exit commands are other ways to exit from try block which is provided by node.js 
        // & have different functionality on particular code i.e 0,1 etc you can see others codes and their tasks.
        process.exit(1)
    }
}

export default connectToDb