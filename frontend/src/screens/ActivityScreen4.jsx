import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Importa las imágenes directamente
import Image1 from '../images/photo1.jpg'; // Asegúrate de usar la ruta correcta
import Image2 from '../images/photo2.jpg'; // Asegúrate de usar la ruta correcta


const differences = [
  { id: 1, name: 'Diferencia 1', isCorrect: true },
  { id: 2, name: 'Diferencia 2', isCorrect: false },
  { id: 3, name: 'Diferencia 3', isCorrect: true },
  { id: 4, name: 'Diferencia 4', isCorrect: false },
  { id: 5, name: 'Diferencia 5', isCorrect: true },
  { id: 6, name: 'Diferencia 6', isCorrect: false },
  { id: 7, name: 'Diferencia 7', isCorrect: true },
  { id: 8, name: 'Diferencia 8', isCorrect: false },
  { id: 9, name: 'Diferencia 9', isCorrect: true },
  { id: 10, name: 'Diferencia 10', isCorrect: false },
];

const ActivityScreen4 = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  const handleOptionClick = (id) => {
    if (selectedOptions.length >= 5 && !selectedOptions.includes(id)) {
      toast.warning('Ya has seleccionado 5 opciones');
      return;
    }

    setSelectedOptions((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((option) => option !== id)
        : [...prevSelected, id]
    );
  };

  const handleSubmit = () => {
    if (selectedOptions.length !== 5) {
      toast.error('Debes seleccionar 5 opciones antes de enviar');
      return;
    }

    let correct = 0;
    let incorrect = 0;

    selectedOptions.forEach((id) => {
      const option = differences.find((diff) => diff.id === id);
      if (option && option.isCorrect) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });

    setCorrectAnswers(correct);
    setIncorrectAnswers(incorrect);
    setGameFinished(true);

    saveActivity(correct, incorrect);
  };

  const saveActivity = async (correct, incorrect) => {
    const activityData = {
      name: 'Encuentra diferencias',
      description: 'Actividad para encontrar las diferencias entre dos imágenes.',
      type: 'diferencias_imagenes',
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      timeUsed: timer,
      scoreObtained: correct, // Guardamos simplemente la cantidad de respuestas correctas
      patientId: 'somePatientId', // Reemplaza con el ID real del paciente
    };

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        toast.success('Actividad guardada correctamente');
        navigate('/activities');
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <div className="find-differences-game">
      <h1>Encuentra las 5 diferencias</h1>
      <p>Tiempo: {timer} segundos</p>

      <div className="images-container">
        <img src={Image1} alt="Imagen 1" />
        <img src={Image2} alt="Imagen 2" />
      </div>

      <div className="options-container">
        {differences.map((difference) => (
          <div
            key={difference.id}
            className={`option ${selectedOptions.includes(difference.id) ? 'selected' : ''}`}
            onClick={() => handleOptionClick(difference.id)}
          >
            {difference.name}
          </div>
        ))}
      </div>

      {!gameFinished && (
        <button onClick={handleSubmit} className="submit-button">Enviar Respuesta</button>
      )}

      {gameFinished && (
        <div className="results">
          <p>Correctas: {correctAnswers}</p>
          <p>Incorrectas: {incorrectAnswers}</p>
          <p>Tiempo total: {timer} segundos</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen4;
