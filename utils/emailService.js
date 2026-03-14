import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        })
        return true
    } catch (error) {
        console.log('Email error:', error)
        return false
    }
}

const doctorAddedTemplate = (doctor) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #09f069 0%, #07c85a 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 500; }
        .value { color: #333; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Welcome to Phamix Hub</h1>
        </div>
        <div class="content">
            <h2>Doctor Account Created</h2>
            <p>Hello <strong>${doctor.name}</strong>,</p>
            <p>Your doctor account has been successfully created in the Phamix Hub system.</p>
            <div class="info-box">
                <div class="info-row"><span class="label">Name:</span><span class="value">${doctor.name}</span></div>
                <div class="info-row"><span class="label">Email:</span><span class="value">${doctor.email}</span></div>
                <div class="info-row"><span class="label">Password:</span><span class="value">${doctor.password}</span></div>
                <div class="info-row"><span class="label">Speciality:</span><span class="value">${doctor.speciality}</span></div>
                <div class="info-row"><span class="label">Experience:</span><span class="value">${doctor.experience}</span></div>
            </div>
            <p>You can now log in to manage your appointments and patient information.</p>
        </div>
        <div class="footer">
            <p>© 2024 Phamix Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

const appointmentConfirmationTemplate = (appointment) => {
    const isDoctor = appointment.isDoctor
    const title = isDoctor ? 'New Appointment Booked' : 'Appointment Confirmed'
    const headerColor = isDoctor ? '#4f46e5' : '#09f069'
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, ${headerColor} 0%, ${isDoctor ? '#4338ca' : '#07c85a'} 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 10px 0; }
        .status-pending { background: #fff3cd; color: #856404; }
        .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 500; }
        .value { color: #333; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 ${title}</h1>
        </div>
        <div class="content">
            <h2>${isDoctor ? 'New Appointment Details' : 'Your Appointment Details'}</h2>
            <span class="status status-pending">Pending</span>
            <div class="info-box">
                ${isDoctor ? 
                    `<div class="info-row"><span class="label">Patient:</span><span class="value">${appointment.patientName || 'N/A'}</span></div>` : 
                    `<div class="info-row"><span class="label">Doctor:</span><span class="value">${appointment.doctorName || 'N/A'}</span></div>
                    <div class="info-row"><span class="label">Speciality:</span><span class="value">${appointment.doctorSpeciality || 'N/A'}</span></div>`
                }
                <div class="info-row"><span class="label">Date:</span><span class="value">${appointment.date || 'N/A'}</span></div>
                <div class="info-row"><span class="label">Time:</span><span class="value">${appointment.slotTime || 'N/A'}</span></div>
                <div class="info-row"><span class="label">Amount:</span><span class="value">$${appointment.amount || '0'}</span></div>
            </div>
            ${!isDoctor ? '<p>Please arrive 15 minutes before your scheduled time.</p>' : ''}
        </div>
        <div class="footer">
            <p>© 2024 Phamix Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
}

const appointmentCancelledTemplate = (appointment) => {
    const isPatient = appointment.isPatient
    const title = isPatient ? 'Your Appointment Has Been Cancelled' : 'Appointment Cancelled'
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 500; }
        .value { color: #333; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Appointment Cancelled</h1>
        </div>
        <div class="content">
            <h2>${title}</h2>
            <div class="info-box">
                ${isPatient ? 
                    `<div class="info-row"><span class="label">Doctor:</span><span class="value">${appointment.doctorName || 'N/A'}</span></div>` :
                    `<div class="info-row"><span class="label">Patient:</span><span class="value">${appointment.patientName || 'N/A'}</span></div>`
                }
                <div class="info-row"><span class="label">Date:</span><span class="value">${appointment.date || 'N/A'}</span></div>
                <div class="info-row"><span class="label">Time:</span><span class="value">${appointment.slotTime || 'N/A'}</span></div>
            </div>
            ${isPatient ? '<p>If you need to reschedule, please book a new appointment through the system.</p>' : ''}
        </div>
        <div class="footer">
            <p>© 2024 Phamix Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
}

const doctorUpdatedTemplate = (doctor) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 500; }
        .value { color: #333; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 Profile Updated</h1>
        </div>
        <div class="content">
            <h2>Your Profile Has Been Updated</h2>
            <p>Hello <strong>${doctor.name}</strong>,</p>
            <p>Your doctor profile has been successfully updated in the Phamix Hub system.</p>
            <div class="info-box">
                <div class="info-row"><span class="label">Email:</span><span class="value">${doctor.email}</span></div>
            </div>
            <p>If you did not make these changes, please contact support immediately.</p>
        </div>
        <div class="footer">
            <p>© 2024 Phamix Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

const doctorDeletedTemplate = (doctor) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Account Deleted</h1>
        </div>
        <div class="content">
            <h2>Your Account Has Been Deleted</h2>
            <p>Hello <strong>${doctor.name}</strong>,</p>
            <p>Your doctor account has been removed from the Phamix Hub system.</p>
            <p>If you believe this was done in error, please contact the administrator.</p>
        </div>
        <div class="footer">
            <p>© 2024 Phamix Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

const patientUpdatedTemplate = (patient) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 500; }
        .value { color: #333; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 Profile Updated</h1>
        </div>
        <div class="content">
            <h2>Your Profile Has Been Updated</h2>
            <p>Hello <strong>${patient.name}</strong>,</p>
            <p>Your profile has been successfully updated in the Phamix Hub system.</p>
            <div class="info-box">
                <div class="info-row"><span class="label">Email:</span><span class="value">${patient.email}</span></div>
            </div>
            <p>If you did not make these changes, please contact support immediately.</p>
        </div>
        <div class="footer">
            <p>© 2024 Phamix Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

const patientAddedTemplate = (patient) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #09f069 0%, #07c85a 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 500; }
        .value { color: #333; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Welcome to Phamix Hub</h1>
        </div>
        <div class="content">
            <h2>Patient Account Created</h2>
            <p>Hello <strong>${patient.name}</strong>,</p>
            <p>Your patient account has been successfully created in the Phamix Hub system.</p>
            <div class="info-box">
                <div class="info-row"><span class="label">Name:</span><span class="value">${patient.name}</span></div>
                <div class="info-row"><span class="label">Email:</span><span class="value">${patient.email}</span></div>
                <div class="info-row"><span class="label">Password:</span><span class="value">${patient.password}</span></div>
            </div>
            <p>You can now log in to book appointments and manage your health records.</p>
        </div>
        <div class="footer">
            <p>© 2024 Phamix Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

const patientDeletedTemplate = (patient) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Account Deleted</h1>
        </div>
        <div class="content">
            <h2>Your Account Has Been Deleted</h2>
            <p>Hello <strong>${patient.name}</strong>,</p>
            <p>Your account has been removed from the Phamix Hub system.</p>
            <p>If you believe this was done in error, please contact the administrator.</p>
        </div>
        <div class="footer">
            <p>© 2024 Phamix Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

export { sendEmail, doctorAddedTemplate, doctorUpdatedTemplate, doctorDeletedTemplate, patientAddedTemplate, patientUpdatedTemplate, patientDeletedTemplate, appointmentConfirmationTemplate, appointmentCancelledTemplate }
