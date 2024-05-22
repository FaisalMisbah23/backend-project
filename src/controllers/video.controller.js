import mongoose, {isValidObjectId} from "mongoose"
import { Video } from "../models/videos.models.js"
import { User } from "../models/users.models.js"
import { ApiResponse } from "../utlis/ApiResponse.js"
import { ApiError } from "../utlis/ApiError.js"
import { asyncHandler } from "../utlis/asyncHandler.js"
import { deleteOnCloundinary, uploadOnCloudinary } from "../utlis/Cloudinary.js"
import multer from "multer"


const getAllVideos = asyncHandler(async (req, res) => {
    const { 
        page = 1,
        limit = 10,
        query = `/^video/`,
        sortBy = "createdAt",
        sortType = 1, 
        userId = req.user._id } = req.query
    //TODO: get all videos based on query, sort, pagination
    // find user in db 
    const user = await User.findById({
        _id:userId
    })
    if (!user) {
        throw new ApiError(401,"User not found")
    }

    const getAllVideosAggregate = Video.aggregate([
        {
            $match: { 
                owner: new mongoose.Types.ObjectId(userId),
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            }
        },
        {
            $sort:{
                [sortBy]: sortType
            }
        },
        {
            $skip: (page -1) * limit
        },
        {
            $limit: parseInt(limit)
        }       
    ])

    Video.aggregatePaginate(getAllVideosAggregate, {page, limit})
    .then((result)=>{
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "fetched all videos successfully !!"
            )
        )
    })
    .catch((error)=>{
        console.log("getting error while fetching all videos:",error)
        throw error
    })


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!(title || description)) {
        throw new ApiError(400,"Invalid title or description")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    // let videoLocalPath;
    // if(req.files && Array.isArray(req.files.videoFile && req.files.videoFile.lenght>0) ){
    //     videoLocalPath = req.files?.videoFile[0]?.path;
    // }
    // let thumbnailLocalPath;
    // if(req.files && Array.isArray(req.files.thumbnailLocalPath && req.files.thumbnailLocalPath.lenght>0) ){
    //     thumbnailLocalPath = req.files?.thumbnailLocalPath[0]?.path;
    // }

    if(!videoLocalPath){
        throw new ApiError(401,"Error while uploading video on multer")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(401,"Error while uploading thumbnail on multer")
    }
    const uploadVideo = await uploadOnCloudinary(videoLocalPath);
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!uploadVideo){
        throw new ApiError(401,"Vedio file is required.")
    }
    const video = await Video.create({
        videoFile:{
            public_id: uploadVideo?.public_id,
            url: uploadVideo?.url
        },
        thumbnail:{
            public_id: uploadThumbnail?.public_id,
            url: uploadThumbnail?.url
        },
        owner:req.user?._id,
        title,
        description,
        duration:uploadVideo?.duration,
        isPublished:true,
    })

    return res.status(201)
    .json(new ApiResponse(201,video,"Vedios uploaded success"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(403, "Video id is not valid")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(403, "Video not found")
    }
    return res.status(200).json(
        new ApiResponse(200, video ,"Vedio fetched success")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description}=req.body;
    // const {thumbnail}= req.file?.path
    const thumbnail= "public\\temp\\QR CODE.png";

    if(!isValidObjectId(videoId)){
        throw new ApiError(402,"video id is not valid")
    }
    if(!thumbnail || !(title || title?.trim() === "") || !(description || description?.trim())){
        throw new ApiError(403,"Updated fields are required")
    }

    // find previous video
    const previousVideo = await Video.findById(videoId)
    if(!previousVideo){
        throw new ApiError(401,"Vedio is not available.")
    }
    let updateFields = {
        $set:{
            title,
            description,
        }
    }
    // delete previous thumbnail and upload new one
    let thumbnailUploadOnCloudinary;
    if(thumbnail){
        await deleteOnCloundinary(previousVideo.thumbnail?.public_id)

        // upload new one 
         thumbnailUploadOnCloudinary = await uploadOnCloudinary(thumbnail);

        if(!thumbnailUploadOnCloudinary){
            throw new ApiError(500, "something went wrong while updating thumbnail on cloudinary !!")
        }
    }

    const updatedVideoDetails = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail:{
                    public_id: thumbnailUploadOnCloudinary.public_id,
                    url: thumbnailUploadOnCloudinary.url
                }
            }
        },
        {
            new: true
        }
    )

    if(!updatedVideoDetails){
        throw new ApiError(500, "something went wrong while updating video details");
    }

        //retrun responce
        return res.status(200).json(new ApiResponse(
            200,
            { updatedVideoDetails },
            "Video details updated successfully!"
        ));
    
    })

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"Vedio id is no valid.")
    }
    const video = await Video.findById(videoId);
    if(!video){
         throw new ApiError(200,"Vedio not found.")
    }
    if(video.owner.toString()!=req.user._id){
        throw new ApiError(403,"You don't have access to delete the vidio.")
    }
    if(video.videoFile){
        await deleteOnCloundinary(video.videoFile.public_id,"video")
    }
    if(video.thumbnail){
        await deleteOnCloundinary(video.thumbnail.public_id,"image")
    }

    const deleteResponse = await Video.findByIdAndDelete(videoId)
    if(!deleteResponse){
        throw new ApiError(402,"Something went wrong while deleting video")
    }

    return res.status(200).json(new ApiResponse(200,deleteResponse,"Video deleted success"))
        
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // find video and updata publish status
    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"Vedio id is no valid")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(402,"Video not find.")
    }
    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(402,"You don't have permission to change the status.")
    }
    video.isPublished=!video.isPublished;
    video.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,video,"Video status updated successfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
