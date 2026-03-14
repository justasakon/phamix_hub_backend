import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    doctorId: { type: String, required: true },
    docData: { type: Object, required: true },
    userData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    slotTime: { type: String, required: true },
    status: { type: String, default: 'pending' },
    payment: { type: Boolean, default: false },
    cancelled: { type: Boolean, default: false }
}, { minimize: false, timestamps: true })

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema)

export default appointmentModel
