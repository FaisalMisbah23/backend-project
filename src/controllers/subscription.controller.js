import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.models.js"
import { User } from "../models/users.models.js"
import { ApiResponse } from "../utlis/ApiResponse.js"
import { ApiError } from "../utlis/ApiError.js"
import { asyncHandler } from "../utlis/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(401,"Channel Id id not valid.")
    }
    const channel = await User.findById({
        _id:channelId
    })
    if(!channel){
        throw new ApiError(402,"Channel not found")
    }
    let subscribe;
    let unsubscribe;

    const itHasSubscriptions = await Subscription.findOne({
        subscriber:req.user?._id,
        channel:channelId
    })

    if(itHasSubscriptions){
        // unsubcribe
        unsubscribe = await Subscription.findOneAndDelete({
            subscriber:req.user?._id,
            channel:channelId
        })

        if(!unsubscribe){
            throw new ApiError(401,"Something went wrong while unsubscribing the channel")
        }

        return res.status(200).json(new ApiResponse(200,unsubscribe,"Channel Unsubscribe successfully"))
    }
    else {
        subscribe = await Subscription.create({
            subscriber:req.user?._id,
            channel:channelId
        })
        if(!subscribe){
            throw new ApiError(401,"Something went wrong while subscribing the channel")
        }

        return res.status(200).json(new ApiResponse(200,subscribe,"Channel subscribed successfully"))
    }
    
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // const {channelId} = req.params
    const {subscriberId} = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(
            400,
            "This channel id is not valid"
        )
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId?.trim())
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
            }
        },
        {
            $project:{
                subscribers:{
                    username: 1,
                    fullName: 1,
                    avatar: 1
                }
            }
        },
    ])
    console.log(subscriptions);

    return res.status(200).json(new ApiResponse(200,subscriptions[0],"Channel subscribers fetched Successfull"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    console.log("req.params",req.params);
    console.log("subscriberId",channelId);
    if(!isValidObjectId(channelId)){
        throw new ApiError(
            400,
            "This subscriber id is not valid"
        )
    }

    const subscriptions = await Subscription.aggregate([
        {
            // in this case i am a subcriber i want to find channel id so
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
            }
        },
        {
            $project:{
                subscribedChannel:{
                    username: 1,
                    avatar: 1
                }
            }
        }
    ])

    console.log(subscriptions)

    return res.status(200).json(
        new ApiResponse(
            200,
            subscriptions[0],
            "All Subscribed channels fetched Successfull!!"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}