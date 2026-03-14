import jwt from "jsonwebtoken"

// Admin authentication middleware
const authAdmin = async (req,res,next) =>{
    try {

        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({success:false,message:'Not Authorised Login Again'})
        }
        
        const token = authHeader.split(' ')[1]
        const token_decode = jwt.verify(token,process.env.JWT_SECRET)

        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.json({success:false,message:'Not Authorised Login Again'})
        }

        next()
        
    } catch (error) {
           console.log(error)
        res.json({success:false,message:error.message})
 
    }
}


export default authAdmin