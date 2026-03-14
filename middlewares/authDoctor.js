import jwt from "jsonwebtoken"
import doctorModel from "../models/doctorModel.js"

const authDoctor = async (req,res,next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        
        if(!token) {
            return res.json({success:false,message:"Not authorized"})
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey")
        const doctor = await doctorModel.findById(decoded.id)
        
        if(!doctor) {
            return res.json({success:false,message:"Not authorized"})
        }
        
        req.doctorId = decoded.id
        next()
    } catch (error) {
        res.json({success:false,message:"Not authorized"})
    }
}

export default authDoctor
