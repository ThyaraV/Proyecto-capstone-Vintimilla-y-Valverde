import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }, // Referencia al paciente
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: false }, // Referencia al doctor
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true }, // Referencia a la actividad
  assignedDate: { type: Date, default: Date.now }, // Fecha en que se asignó la actividad
  completionDate: { type: Date }, // Fecha de finalización de la actividad
  scoreObtained: { type: Number }, // Puntaje obtenido en la actividad
  timeUsed: { type: Number }, // Tiempo en segundos que tomó completar la actividad
  progress: { type: String }, // Progreso cualitativo (ej. "mejorando", "estable")
  observations: { type: String }, // Observaciones adicionales del doctor
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
