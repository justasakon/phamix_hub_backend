import userModel from "../models/userModel.js"
import bcrypt from "bcrypt"
import { sendEmail, patientAddedTemplate, patientUpdatedTemplate, patientDeletedTemplate } from "../utils/emailService.js"

const getAllPatients = async (req,res) => {
    try {
        const patients = await userModel.find({}).select('-password')
        res.json({success:true,patients})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const getPatientById = async (req,res) => {
    try {
        const patient = await userModel.findById(req.params.id).select('-password')
        if(!patient) {
            return res.json({success:false,message:"Patient not found"})
        }
        res.json({success:true,patient})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const createPatient = async (req,res) => {
    try {
        const { name, email, password, phone, gender, dob, address } = req.body
        
        if(!name || !email || !password) {
            return res.json({success:false,message:"Missing required details"})
        }

        const existingUser = await userModel.findOne({email})
        if(existingUser) {
            return res.json({success:false,message:"Email already registered"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const patientData = {
            name,
            email,
            password: hashedPassword,
            phone: phone || '0000000000000',
            gender: gender || 'Not Selected',
            dob: dob || 'Not Selected',
            address: address || { line1: '', line2: '' },
            date: Date.now()
        }

        const newPatient = new userModel(patientData)
        await newPatient.save()

        // Send welcome email
        await sendEmail(
            email,
            'Welcome to Phamix Hub - Your Account Details',
            patientAddedTemplate({ name, email, password })
        )

        res.json({success:true,message:"Patient added successfully"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const updatePatient = async (req,res) => {
    try {
        const { name, email, phone, gender, dob, address } = req.body
        const patient = await userModel.findById(req.params.id)
        
        if(!patient) {
            return res.json({success:false,message:"Patient not found"})
        }

        const updateData = {}
        if(name) updateData.name = name
        if(email) updateData.email = email
        if(phone) updateData.phone = phone
        if(gender) updateData.gender = gender
        if(dob) updateData.dob = dob
        if(address) updateData.address = typeof address === 'string' ? JSON.parse(address) : address

        const updatedPatient = await userModel.findByIdAndUpdate(req.params.id, updateData, {new:true}).select('-password')
        
        // Send update notification email
        await sendEmail(
            updatedPatient.email,
            'Profile Updated - Phamix Hub',
            patientUpdatedTemplate({ name: updatedPatient.name, email: updatedPatient.email })
        )
        
        res.json({success:true,message:"Patient updated",patient:updatedPatient})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const deletePatient = async (req,res) => {
    try {
        const patient = await userModel.findByIdAndDelete(req.params.id)
        if(!patient) {
            return res.json({success:false,message:"Patient not found"})
        }
        
        // Send deletion notification email
        await sendEmail(
            patient.email,
            'Account Deleted - Phamix Hub',
            patientDeletedTemplate({ name: patient.name })
        )
        
        res.json({success:true,message:"Patient deleted"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export {getAllPatients, getPatientById, createPatient, updatePatient, deletePatient}
