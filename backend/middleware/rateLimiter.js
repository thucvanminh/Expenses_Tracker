import ratelimiter from "../config/upstash.js"
import ratelimit from "../config/upstash.js";

const rateLimiter = async (req,res,next)=>{
    try{
        const {success} = await ratelimit.limit("my-rate-limit")
        if(!success){
            return res.status(429).json({message: "Too many requests, please try again later."});

        }
    }catch(err){
        console.log("Error in rate limiter middleware:", err);
        // res.status(500).json({error: "Internal Server Error"});
        next(err);
    }
}


export  default rateLimiter;
