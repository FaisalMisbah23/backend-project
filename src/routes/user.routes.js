import { Router } from "express";
import { changeCurrentPassword, getChannel, getCurrentUser, getUserHistory, loginUser, logoutUser, refreshLoginToken, registerUser, updateUserDetailed } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
router.route("/login").post(loginUser)

// secure
router.route("/logout").post(verifyJWT,logoutUser)

// secure 
router.route('/refresh-token').post(refreshLoginToken)
router.route('/changepassword').post(verifyJWT,changeCurrentPassword)
router.route('/user').get(verifyJWT,getCurrentUser)
router.route('/updateuser').patch(verifyJWT,updateUserDetailed)
router.route('/c/:username').get(verifyJWT,getChannel)
router.route('/watchHistory').get(verifyJWT,getUserHistory)

export default router
