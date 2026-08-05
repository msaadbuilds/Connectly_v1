import mongoose from 'mongoose';

const userschema = new mongoose.Schema({
    fullName: {
        type: String
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    profilePic: {
        type:String,
        default: ""
    },

    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String
    },
    Otp: {
        type: String,
        default: ''
    },
    OtpExpireAt: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

const User = mongoose.model("Auth", userschema);
export default User;