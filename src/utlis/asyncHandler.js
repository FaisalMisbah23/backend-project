// way to actually write 
// const asyncHanlder = (fn) => {()=>{}}

// with promise
const asyncHanlder = (fn) => (req,res,next) => {
    Promise.resolve(fn(req,res,next)).catch((error)=>{next(error)})
}

export {asyncHanlder}

// with try-catch method
// as there are four parameters that are err, req, res, next
// const asyncHanlder = (fn) => async (req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code | 500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }