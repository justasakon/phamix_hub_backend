import appointmentModel from "../models/appointmentModel.js"
import doctorModel from "../models/doctorModel.js"
import userModel from "../models/userModel.js"
import { sendEmail, appointmentConfirmationTemplate, appointmentCancelledTemplate } from "../utils/emailService.js"

const getAllAppointments = async (req,res) => {
    try {
        const appointments = await appointmentModel.find({}).sort({date: -1})
        res.json({success:true,appointments})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const createAppointment = async (req,res) => {
    try {
        const { doctorId, patientId, date, slotTime, amount } = req.body
        
        if (!doctorId || !patientId || !date || !slotTime || !amount) {
            return res.json({success:false,message:"Missing required fields"})
        }

        // Get doctor and patient data
        const doctor = await doctorModel.findById(doctorId)
        const patient = await userModel.findById(patientId)

        if (!doctor) {
            return res.json({success:false,message:"Doctor not found"})
        }
        if (!patient) {
            return res.json({success:false,message:"Patient not found"})
        }

        // Create appointment
        const appointment = new appointmentModel({
            userId: patientId,
            doctorId: doctorId,
            docData: {
                name: doctor.name,
                speciality: doctor.speciality,
                fees: doctor.fees,
                address: doctor.address
            },
            userData: {
                name: patient.name,
                email: patient.email,
                phone: patient.phone
            },
            amount: parseInt(amount),
            date: new Date(date).getTime(),
            slotTime: slotTime,
            status: 'pending',
            payment: true,
            cancelled: false
        })

        await appointment.save()

        // Send confirmation email to patient
        const appointmentData = {
            patientName: patient.name,
            doctorName: doctor.name,
            doctorSpeciality: doctor.speciality,
            date: new Date(date).toLocaleDateString(),
            slotTime: slotTime,
            amount: amount
        }
        
        await sendEmail(
            patient.email,
            'Appointment Confirmed - Phamix Hub',
            appointmentConfirmationTemplate(appointmentData)
        )

        // Send notification email to doctor
        await sendEmail(
            doctor.email,
            'New Appointment Booked - Phamix Hub',
            appointmentConfirmationTemplate({...appointmentData, patientName: patient.name, isDoctor: true})
        )

        res.json({success:true,message:"Appointment created successfully",appointment})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const cancelAppointment = async (req,res) => {
    try {
        const appointment = await appointmentModel.findById(req.params.id)
        if(!appointment) {
            return res.json({success:false,message:"Appointment not found"})
        }

        appointment.cancelled = true
        await appointment.save()

        // Release the doctor's slot
        const doctor = await doctorModel.findById(appointment.doctorId)
        if(doctor && doctor.slots_booked) {
            const date = new Date(appointment.date).toDateString()
            if(doctor.slots_booked[date]) {
                doctor.slots_booked[date] = doctor.slots_booked[date].filter(slot => slot !== appointment.slotTime)
                await doctor.save()
            }
        }

        // Send cancellation emails
        const cancelData = {
            doctorName: appointment.docData?.name || 'N/A',
            patientName: appointment.userData?.name || 'N/A',
            date: new Date(appointment.date).toLocaleDateString(),
            slotTime: appointment.slotTime
        }

        // Notify patient
        if (appointment.userData?.email) {
            await sendEmail(
                appointment.userData.email,
                'Appointment Cancelled - Phamix Hub',
                appointmentCancelledTemplate({...cancelData, isPatient: true})
            )
        }

        // Notify doctor
        if (appointment.docData?.name) {
            await sendEmail(
                doctor?.email,
                'Appointment Cancelled - Phamix Hub',
                appointmentCancelledTemplate({...cancelData, isPatient: false})
            )
        }

        res.json({success:true,message:"Appointment cancelled"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const getAppointmentStats = async (req,res) => {
    try {
        const totalAppointments = await appointmentModel.countDocuments()
        const pendingAppointments = await appointmentModel.countDocuments({status: 'pending', cancelled: false})
        const completedAppointments = await appointmentModel.countDocuments({status: 'completed', cancelled: false})
        const cancelledAppointments = await appointmentModel.countDocuments({cancelled: true})
        
        // Get total doctors and patients - use explicit collection names
        const totalDoctors = await doctorModel.countDocuments()
        const totalPatients = await userModel.countDocuments()
        
        console.log('Stats - Doctors:', totalDoctors, 'Patients:', totalPatients)
        
        const totalRevenue = await appointmentModel.aggregate([
            {$match: {cancelled: false, payment: true}},
            {$group: {_id: null, total: {$sum: "$amount"}}}
        ])

        // Get appointments by month for last 6 months
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        const sixMonthsAgoTime = sixMonthsAgo.getTime()
        
        const allAppointments = await appointmentModel.find({date: {$gte: sixMonthsAgoTime}})
        
        // Group by month in JavaScript
        const monthCounts = {}
        allAppointments.forEach(apt => {
            const date = new Date(apt.date)
            const month = date.getMonth() + 1
            monthCounts[month] = (monthCounts[month] || 0) + 1
        })
        
        const appointmentsByMonth = Object.entries(monthCounts)
            .map(([month, count]) => ({ _id: parseInt(month), count }))
            .sort((a, b) => a._id - b._id)

        // Get doctors with most appointments
        const doctorAppointments = await appointmentModel.find({cancelled: false})
        
        const doctorCounts = {}
        doctorAppointments.forEach(apt => {
            const docId = apt.doctorId
            doctorCounts[docId] = (doctorCounts[docId] || 0) + 1
        })
        
        const topDoctorsData = Object.entries(doctorCounts)
            .map(([doctorId, count]) => ({ doctorId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        
        const topDoctors = await Promise.all(
            topDoctorsData.map(async (item) => {
                const doctor = await doctorModel.findById(item.doctorId)
                return {
                    doctorName: doctor?.name || 'Unknown',
                    count: item.count
                }
            })
        )

        res.json({
            success:true,
            stats: {
                totalAppointments,
                pendingAppointments,
                completedAppointments,
                cancelledAppointments,
                totalDoctors,
                totalPatients,
                totalRevenue: totalRevenue[0]?.total || 0,
                appointmentsByMonth,
                topDoctors
            }
        })
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const updateAppointmentStatus = async (req,res) => {
    try {
        const { status } = req.body
        const appointment = await appointmentModel.findById(req.params.id)
        
        if(!appointment) {
            return res.json({success:false,message:"Appointment not found"})
        }

        appointment.status = status
        await appointment.save()

        res.json({success:true,message:"Appointment status updated",appointment})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export {getAllAppointments, createAppointment, cancelAppointment, getAppointmentStats, updateAppointmentStatus}
