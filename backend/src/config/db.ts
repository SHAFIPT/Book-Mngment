import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUrl = process.env.MONGO_URI;
    console.log(mongoUrl)
    if (!mongoUrl) {   
        throw new Error("MONGO_URI is not defined in the environment variables");
    }
    try {
        await mongoose.connect(mongoUrl)   
        console.log('mongoose connected..')
    } catch (error) {
        console.error(error)
    }
}

export default connectDB