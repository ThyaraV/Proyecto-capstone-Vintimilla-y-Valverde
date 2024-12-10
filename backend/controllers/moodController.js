// src/controllers/moodController.js

import asyncHandler from 'express-async-handler';
import Mood from '../models/moodModel.js';
import Patient from '../models/patientModel.js';

const saveUserMood = asyncHandler(async (req, res) => {
  const { mood } = req.body;

  if (!mood) {
    res.status(400);
    throw new Error('Por favor, proporciona un estado de ánimo válido');
  }

  // Encuentra al paciente asociado al usuario
  const patient = await Patient.findOne({ user: req.user._id }); // Busca el paciente por user._id
  if (!patient) {
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  // Guarda el mood asociado al patient._id
  const newMood = await Mood.create({
    patient: patient._id,
    mood,
  });

  res.status(201).json({
    message: 'Estado de ánimo guardado correctamente',
    mood: newMood,
  });
});

const getPatientMoods = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // Busca los estados de ánimo del paciente por su ID
  const moods = await Mood.find({ patient: patientId }).sort({ date: 1 });

  if (!moods || moods.length === 0) {
    res.status(404);
    throw new Error('No se encontraron estados de ánimo para este paciente');
  }

  res.json(moods);
});


export { saveUserMood, getPatientMoods};
