import mongoose from "mongoose";
import { User } from "./userModel.js";

const doctorSchema =  User.discriminator('Doctor', new mongoose.Schema({
    especialidad:{
        type:String,
        required:true,
    },
    patients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }]
},{
    timestamps: true,
}))

const Doctor=mongoose.model('Doctor', doctorSchema);

export default Doctor;