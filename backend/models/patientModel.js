import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  school: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, required: true },
  educationalLevel: { type: String, required: true },
  familyRepresentative: { type: String, required: true },
  address: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  profession: { type: String, required: true },
  cognitiveStage: { type: String, required: true },
  referredTo: { type: String, required: true },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  }, // Relación con Doctor
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
