import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/videos.models.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiResponse } from "../utlis/ApiResponse.js"
import { ApiError } from "../utlis/ApiError.js"
import { asyncHandler } from "../utlis/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }