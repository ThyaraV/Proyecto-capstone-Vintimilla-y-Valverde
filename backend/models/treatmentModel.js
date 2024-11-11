import mongoose from 'mongoose';

const treatmentSchema = new mongoose.Schema({
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }], // Lista de pacientes
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Referencia al doctor
  treatmentName: { type: String, required: true }, // Nombre del tratamiento
  description: { type: String, required: true }, // Descripción general del tratamiento
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }], // Lista de actividades
  medications: [
    {
      name: { type: String, required: true }, // Nombre del medicamento
      dosage: { type: String, required: true }, // Dosis
      frequency: { type: String, required: true }, // Frecuencia
      startDate: { type: Date, required: true }, // Fecha de inicio
      endDate: { type: Date }, // Fecha de fin
      imageUrl: { type: String }, // URL de la imagen
    },
  ],
  exerciseVideos: [
    {
      title: { type: String, required: true }, // Título del video
      description: { type: String }, // Descripción
      url: { type: String, required: true }, // URL del video
      duration: { type: Number }, // Duración en segundos
      assignedDate: { type: Date, default: Date.now }, // Fecha de asignación
    },
  ],
  startDate: { type: Date, default: Date.now }, // Fecha de inicio del tratamiento
  endDate: { type: Date }, // Fecha de finalización
  progress: { type: String, enum: ['mejorando', 'estable', 'empeorando'], default: 'estable' },
  adherence: { type: Number, default: 0, min: 0, max: 100 }, // Adherencia
  observations: { type: String }, // Observaciones del doctor
  nextReviewDate: { type: Date }, // Próxima revisión
  createdAt: { type: Date, default: Date.now }, // Fecha de creación
  updatedAt: { type: Date, default: Date.now }, // Fecha de actualización
});

const Treatment = mongoose.model('Treatment', treatmentSchema);
export default Treatment;
