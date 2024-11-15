// src/components/Popup.jsx

import React, { useState } from 'react';
import '../assets/styles/Popup.css';

function Popup({ moods, setSelectedMood }) {
  console.log('Popup renderizado'); // Log para depuración
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleSelectMood = (index) => {
    setSelectedIndex(index);
    setSelectedMood(moods[index]);
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <h1>¿Cómo se siente hoy?</h1>
        <div className="mood-meter">
          {/* Flecha del velocímetro */}
          <div className="arrow" style={{ transform: `rotate(${selectedIndex * 45 - 90}deg)` }}></div>
          
          {/* Contenedor para los emojis */}
          {moods.map((mood, index) => (
            <div
              key={index}
              className="mood-wrapper"
              style={{ transform: `rotate(${index * 45}deg)` }}
            >
              <button
                className="mood-button"
                onClick={() => handleSelectMood(index)}
                style={{ color: mood.color }}
              >
                {mood.emoji}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Popup;
