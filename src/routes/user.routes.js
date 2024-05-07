import { Router } from "express";
import { loginUser, logoutUser, refreshLoginToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

// const router = Router()

// router.route("/register").post(
    
//     upload.fields([{
//         name : "avatar",
//         maxCount : 1
//     },{
//         name : "coverImage",
//         maxCount : 1
//     }
// ])
//     ,registerUser)

// export default router



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


export default router