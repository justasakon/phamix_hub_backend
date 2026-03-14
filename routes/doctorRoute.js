import express from 'express'
import { loginDoctor, getDoctorProfile, updateDoctorProfile, getDoctorAppointments } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'

const doctorRouter = express.Router()

doctorRouter.post('/login', loginDoctor)
doctorRouter.get('/profile', authDoctor, getDoctorProfile)
doctorRouter.put('/profile', authDoctor, updateDoctorProfile)
doctorRouter.get('/appointments', authDoctor, getDoctorAppointments)

export default doctorRouter
