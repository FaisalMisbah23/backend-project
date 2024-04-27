import { asyncHandler } from "../utlis/asyncHandler.js";

const registerUser = asyncHandler(async (req,res) => {
    res.status(200).json({
        message : 'User registration'
    })
})

export {registerUser}