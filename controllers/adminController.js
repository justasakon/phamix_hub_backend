import validator from "validator" 
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import jwt from "jsonwebtoken"
import { sendEmail, doctorAddedTemplate, doctorUpdatedTemplate, doctorDeletedTemplate } from "../utils/emailService.js"

const addDoctor = async (req,res) => {
    try {
        const {name, email, password, speciality, degree, experience, about, fees, address} = req.body 
        const imageFile = req.file
        
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({success:false,message:"Missing Details"})
        }

        if(!imageFile) {
            return res.json({success:false,message:"Please upload a doctor photo"})
        }

        if(!validator.isEmail(email)) {
            return res.json({success:false,message:"Please enter a valid email"})
        }

        if(password.length < 8){
            return res.json({success:false,message:"Please enter a strong password"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            Image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:typeof address === 'string' ? JSON.parse(address) : address,
            date:Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        // Send welcome email to doctor
        const emailSent = await sendEmail(
            email,
            'Welcome to Phamix Hub - Your Account Details',
            doctorAddedTemplate({ name, email, password, speciality, fees })
        )
        
        if (emailSent) {
            console.log(`Welcome email sent to ${email}`)
        } else {
            console.log(`Failed to send welcome email to ${email}`)
        }

        res.json({success:true,message:"Doctor Added"})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }                        
}

const loginAdmin = async (req,res) => {
    try {
        const {email,password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const getAllDoctors = async (req,res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const getDoctorById = async (req,res) => {
    try {
        const doctor = await doctorModel.findById(req.params.id).select('-password')
        if(!doctor) {
            return res.json({success:false,message:"Doctor not found"})
        }
        res.json({success:true,doctor})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const updateDoctor = async (req,res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address, available } = req.body
        const doctor = await doctorModel.findById(req.params.id)
        
        if(!doctor) {
            return res.json({success:false,message:"Doctor not found"})
        }

        const updateData = {}
        if(name) updateData.name = name
        if(email) updateData.email = email
        if(speciality) updateData.speciality = speciality
        if(degree) updateData.degree = degree
        if(experience) updateData.experience = experience
        if(about) updateData.about = about
        if(fees) updateData.fees = fees
        if(address) updateData.address = typeof address === 'string' ? JSON.parse(address) : address
        if(available !== undefined) updateData.available = available
        
        if(password) {
            const salt = await bcrypt.genSalt(10)
            updateData.password = await bcrypt.hash(password,salt)
        }

        if(req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, {resource_type:"image"})
            updateData.Image = imageUpload.secure_url
        }

        const updatedDoctor = await doctorModel.findByIdAndUpdate(req.params.id, updateData, {new:true}).select('-password')
        
        // Send update notification email
        await sendEmail(
            updatedDoctor.email,
            'Profile Updated - Phamix Hub',
            doctorUpdatedTemplate({ name: updatedDoctor.name, email: updatedDoctor.email })
        )
        
        res.json({success:true,message:"Doctor updated",doctor:updatedDoctor})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const deleteDoctor = async (req,res) => {
    try {
        const doctor = await doctorModel.findByIdAndDelete(req.params.id)
        if(!doctor) {
            return res.json({success:false,message:"Doctor not found"})
        }
        
        // Send deletion notification email
        await sendEmail(
            doctor.email,
            'Account Deleted - Phamix Hub',
            doctorDeletedTemplate({ name: doctor.name })
        )
        
        res.json({success:true,message:"Doctor deleted"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export {addDoctor,loginAdmin, getAllDoctors, updateDoctor, deleteDoctor, getDoctorById}