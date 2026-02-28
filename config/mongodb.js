import mongoose from 'mongoose';

const connectDB = async()=>{
    try{
        const url = process.env.MONGO_URL;
        if(!url){
            throw new Error("invalid string");
            return
        };

        const conn = await mongoose.connect(url);
        console.log('Data base is connected to:', conn.connection.host);
        console.log('Data base name is:', conn.connection.name);

    }catch(err){
        console.log('Unable to connect to database', err.message);
    }
};

export default connectDB;