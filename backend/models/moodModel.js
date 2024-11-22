// src/models/moodModel.js

import mongoose from 'mongoose';

const moodSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    mood: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Mood = mongoose.model('Mood', moodSchema);

export default Mood;
