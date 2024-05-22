import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/videos.models.js"
import { ApiResponse } from "../utlis/ApiResponse.js"
import { ApiError } from "../utlis/ApiError.js"
import { asyncHandler } from "../utlis/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(402,"Video id is not valid")
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(402,"Video is not availible.")
    }

    const commentsAggregate=await Comment.aggregate([{
        $match:{
            video:new mongoose.Types.ObjectId(videoId)
        }
    }])

    Comment.aggregatePaginate(commentsAggregate,{
        page,
        limit
    })

    .then((result)=>{
        return res.status(200).json(new ApiResponse(200,result,"Video Comments fetched successs"))
    })
    .catch((error)=>{
        throw new ApiError(402,"Something went wrong while fetching the comments : ",error)
    })
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { comment } = req.body;
    const { videoId } = req.params

    console.log("req params ",req.params)

    if( !comment || comment?.trim()===""){
        throw new ApiError(400, "comment is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"Invalid video Id")
    }
    const VideoComment = await Comment.create({
        content:comment,
        video:videoId,
        owner:req.user?._id
    })

    if(!VideoComment){
        throw new ApiError(402,"Something went wrong while uploading comment.")
    }

    return res.status(200).json(new ApiResponse(200,VideoComment,"Comment uploaded successfully."))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {newComment}=req.body;
    const {commentId}=req.params;

    if(!newComment||newComment?.trim()===""){
        throw new ApiError(403,"Comment is required")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(401,"Comment Id is not valid")
    }
    const newVideoComment = await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content:newComment
        }},{
            new:true
        }
    )

    if(!newVideoComment){
        throw new ApiError(401,"Something went wrong while updating Comment")
    }

    return res.status(200).json(new ApiResponse(200,newVideoComment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(401,"Comment Id is not valid")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(401,"Comment not found")
    }
    if(comment.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You don't have access to delte the comment.")
    }
    const deleteComment = await Comment.deleteOne(comment._id)
    if(!deleteComment){
        throw new ApiError(401,"Something went wrong while delting comment")
    }
    return res.status(200).json(new ApiResponse(200,deleteComment,"Comment deleted successs"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
