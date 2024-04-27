// way to actually write 
// const asyncHandler = (fn) => {()=>{}}

// with promise
const asyncHandler = (fn) => { return (req,res,next) => {
    Promise.resolve(fn(req,res,next)).catch((error)=>{next(error)})
}}

export {asyncHandler}

// with try-catch method
// as there are four parameters that are err, req, res, next
// const asyncHandler = (fn) => async (req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code | 500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }