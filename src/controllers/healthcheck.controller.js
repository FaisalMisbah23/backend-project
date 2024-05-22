import { ApiError } from "../utlis/ApiError.js";
import { ApiResponse } from "../utlis/ApiResponse.js";
import { asyncHandler } from "../utlis/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
        // TODO: build a healthcheck response that simply returns the OK status as json with a message
    const healthCheck={
        uptime:process.uptime(),
        message : 'ok',
        responseTime:process.hrtime(),
        timestamps:Date.now()
    }
    try {
        return res.status(200)
        .json(new ApiResponse(200,healthCheck,"health is good"))
    } catch (error) {
        console.error("Error in healthCheck:",error);
        healthCheck.message=error;
        throw new ApiError(400,"getting error in health checkTime")
    }

});

export {
    healthcheck,
};
