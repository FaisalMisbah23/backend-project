import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utlis/Cloudinary.js";
import { asyncHandler } from "../utlis/asyncHandler.js";
import {ApiError} from '../utlis/ApiError.js'
import {ApiResponse} from '../utlis/ApiResponse.js'

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req,res) => {
        // <---Try to solve the problem by first dividing into parts --->
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    
    const {username, email, password, fullName} = req.body
    if([username,email,password,fullName].some((field)=>{field?.trim() === ""})){
        throw new ApiError(400, "All field are required")
    }
    // don't forget to add await (database is in another quientient)
    const exitedUser = await User.findOne({email})
    if(exitedUser){
        throw new ApiError(409,"User already exist")
    }
    // multer provides these files 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;  
    // direct implementation of req.files?.coverImage[0]?.path can cause erros do this to solve Errors
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage && req.files.coverImage.length>0)) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        username:username.toLowerCase(),
        fullName,
        email,
        password,
        avatar : avatar?.url,
        coverImage : coverImage?.url || "",
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

    const loginUser = asyncHandler ( async (req,res) => {
        // data -> req
        // pssword check
        // access token & refresh token
        // send cookies

        const {username,email,password} = req.body

        if(!username && !email){
            throw new ApiError(401,"Invalid username & email")
        }

        const user = await User.findOne({$or: [{email} , {username}]})

        if(!user){
            throw new ApiError(501,"User does not exist")
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password)

        if(!isPasswordCorrect){
            throw new ApiError(401,"Password is not correct")
        }

        const {refreshToken,accessToken} = await generateAccessAndRefereshTokens(user._id)

        // at this stage we are getting old refresh Token which is empty 
        // now we have 2 options 1) to made new req to db 2) to update existing one
        
        const loggedInUser = await User.findById(user._id).select("-password")

        const options = {
            httpOnly: true,
            secure: false
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )
    
    })
    

    const logoutUser = asyncHandler ( async (req,res) => {
        // to logout user required only to empty refresh token in db & clear the cookies
        // we have to get refresh token beofre to update it we made a middleware first and then update it
        await User.findByIdAndUpdate(
            req.user._id,
            {
            $set : {
                refreshToken : undefined
            }
        },
        {
            // we can pass extra field to give response
            new : true
        }
        )

        const options = {
            httpOnly : true ,
            secure : false
        }

        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(201,{},"Logged out Success"))
    })

const refreshLoginToken = asyncHandler (async()=>{
    const inComingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!inComingRefreshToken) {
        throw new ApiError(401,"UnAuthorized Request")
    }

    // get id from the incoming refresh Token
    const user = await User.findOne(inComingRefreshToken?._id)
    if(!user){
        throw new ApiError(401,"Unauthorized")
    }

    if(inComingRefreshToken !== user.refreshToken ){
        throw new ApiError(401,"Refresh Token is expired & not found")
    }

    const {refreshToken,accessToken} = await generateAccessAndRefereshTokens(user._id)

    const options = {
        httpOnly : true ,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(

        new ApiResponse(200,accessToken,refreshToken,"Access Token Refresed Successfully")
    )


})
export {registerUser,loginUser,logoutUser,refreshLoginToken}