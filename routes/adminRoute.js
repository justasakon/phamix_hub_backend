import express from 'express'
import { addDoctor,loginAdmin, getAllDoctors, updateDoctor, deleteDoctor, getDoctorById } from '../controllers/adminController.js'
import { getAllAppointments, createAppointment, cancelAppointment, getAppointmentStats, updateAppointmentStatus } from '../controllers/appointmentController.js'
import { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../controllers/patientController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'


const adminRouter = express.Router()

// Auth
adminRouter.post('/login',loginAdmin)

// Doctor CRUD
adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.get('/doctors',authAdmin,getAllDoctors)
adminRouter.get('/doctors/:id',authAdmin,getDoctorById)
adminRouter.put('/doctors/:id',authAdmin,upload.single('image'),updateDoctor)
adminRouter.delete('/doctors/:id',authAdmin,deleteDoctor)

// Appointments
adminRouter.post('/appointments',authAdmin,createAppointment)
adminRouter.get('/appointments',authAdmin,getAllAppointments)
adminRouter.put('/appointments/:id/status',authAdmin,updateAppointmentStatus)
adminRouter.put('/appointments/:id/cancel',authAdmin,cancelAppointment)
adminRouter.get('/appointments/stats',authAdmin,getAppointmentStats)

// Patients (users)
adminRouter.post('/patients',authAdmin,createPatient)
adminRouter.get('/patients',authAdmin,getAllPatients)
adminRouter.get('/patients/:id',authAdmin,getPatientById)
adminRouter.put('/patients/:id',authAdmin,updatePatient)
adminRouter.delete('/patients/:id',authAdmin,deletePatient)


export default adminRouter