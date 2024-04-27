import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile : {
        type : String ,
        required : true
    },
    thumbnail : {
        type : string , // cloundianry url
        required : true
    },
    owner : {
        type : mongoose.Types.ObjectId ,
        ref : 'User'
    },
    title : {
        type : String ,
        required : true
    },
    description : {
        type : String ,
        required : true
    },
    duration : {
        type : Number , // from couldianry
        required : true
    },
    views : {
        type : Number ,
        default : 0
    },
    isPublished : {
        type : Boolean ,
        default : true
    }

},{timestamps : true})
// Schemas are plugbale, that is they allow for applying pre package capabilites to extend their functionality. 
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video',videoSchema)