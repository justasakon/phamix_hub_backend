 import doctorModel from "../models/doctorModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

//API for adding a doctor
const addDoctor = async (req,res) => {
    try {
        
        const { name,email,password,speciality,degree,experience,about,fees,address} = req.body

    } catch (error) {
        
    }
 }

const loginDoctor = async (req,res) => {
    try {
        const { email, password } = req.body
        
        const doctor = await doctorModel.findOne({email})
        
        if(!doctor) {
            return res.json({success:false,message:"Invalid credentials"})
        }
        
        const isMatch = await bcrypt.compare(password, doctor.password)
        
        if(!isMatch) {
            return res.json({success:false,message:"Invalid credentials"})
        }
        
        const token = jwt.sign({id: doctor._id}, process.env.JWT_SECRET || "supersecretkey", {
            expiresIn: "7d"
        })
        
        res.json({success:true,token,doctor: {
            _id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            speciality: doctor.speciality,
            degree: doctor.degree,
            experience: doctor.experience,
            about: doctor.about,
            fees: doctor.fees,
            Image: doctor.Image
        }})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const getDoctorProfile = async (req,res) => {
    try {
        const doctor = await doctorModel.findById(req.doctorId).select('-password')
        if(!doctor) {
            return res.json({success:false,message:"Doctor not found"})
        }
        res.json({success:true,doctor})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const updateDoctorProfile = async (req,res) => {
    try {
        const { name, email, phone, speciality, degree, experience, about, fees, address } = req.body
        
        const doctor = await doctorModel.findById(req.doctorId)
        if(!doctor) {
            return res.json({success:false,message:"Doctor not found"})
        }
        
        const updateData = {}
        if(name) updateData.name = name
        if(email) updateData.email = email
        if(phone) updateData.phone = phone
        if(speciality) updateData.speciality = speciality
        if(degree) updateData.degree = degree
        if(experience) updateData.experience = experience
        if(about) updateData.about = about
        if(fees) updateData.fees = fees
        if(address) updateData.address = typeof address === 'string' ? JSON.parse(address) : address

        const updatedDoctor = await doctorModel.findByIdAndUpdate(req.doctorId, updateData, {new:true}).select('-password')
        
        res.json({success:true,message:"Profile updated",doctor:updatedDoctor})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const getDoctorAppointments = async (req,res) => {
    try {
        const appointmentModel = (await import('../models/appointmentModel.js')).default
        const userModel = (await import('../models/userModel.js')).default
        const doctorModel = (await import('../models/doctorModel.js')).default
        
        const appointments = await appointmentModel.find({doctorId: req.doctorId})
            .populate('userData', 'name email phone')
            .sort({date: -1})
        
        const doctor = await doctorModel.findById(req.doctorId)
        
        const appointmentsWithDoctorData = appointments.map(apt => ({
            ...apt.toObject(),
            docData: doctor ? { name: doctor.name, speciality: doctor.speciality } : null
        }))
        
        res.json({success:true,appointments:appointmentsWithDoctorData})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export {addDoctor, loginDoctor, getDoctorProfile, updateDoctorProfile, getDoctorAppointments}