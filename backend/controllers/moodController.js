// src/controllers/moodController.js

import asyncHandler from 'express-async-handler';
import Mood from '../models/moodModel.js';
import Patient from '../models/patientModel.js';

// @desc    Guardar el estado de ánimo del usuario
// @route   POST /api/user/mood
// @access  Privado/Paciente
const saveUserMood = asyncHandler(async (req, res) => {
  const { mood } = req.body;

  if (!mood) {
    res.status(400);
    throw new Error('Por favor, proporciona un estado de ánimo válido');
  }

  // Obtener el paciente asociado al usuario autenticado
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  // Crear un nuevo registro de estado de ánimo
  const newMood = await Mood.create({
    user: req.user._id,
    mood,
  });

  res.status(201).json({
    message: 'Estado de ánimo guardado correctamente',
    mood: newMood,
  });
});

export { saveUserMood };
