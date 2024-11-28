// src/screens/ActivityScreenLevel3.jsx

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Definición de categorías y palabras de nivel 3
const categoriesLevel3 = [
  { id: 1, name: 'Colores' },
  { id: 2, name: 'Formas' },
  { id: 3, name: 'Frutas' },
  { id: 4, name: 'Animales' }
];

const wordsLevel3 = [
  { id: 1, text: 'Marrón', category: 'Colores', style: { backgroundColor: 'brown' } },
  { id: 2, text: 'Pentágono', category: 'Formas', style: { width: '100px', height: '100px', backgroundColor: 'gray', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' } },
  { id: 3, text: 'Rosa', category: 'Colores', style: { backgroundColor: 'pink' } },
  { id: 4, text: 'Hexágono', category: 'Formas', style: { width: '100px', height: '100px', backgroundColor: 'gray', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' } },
  { id: 5, text: 'Sandía', category: 'Frutas', style: { backgroundColor: 'green' } },
  { id: 6, text: 'Melón', category: 'Frutas', style: { backgroundColor: 'yellow' } },
  { id: 7, text: 'Perro', category: 'Animales', style: { backgroundColor: 'brown' } },
  { id: 8, text: 'Gato', category: 'Animales', style: { backgroundColor: 'gray' } },
  { id: 9, text: 'Elefante', category: 'Animales', style: { backgroundColor: 'gray' } },
  { id: 10, text: 'León', category: 'Animales', style: { backgroundColor: 'orange' } }
];

// Componente principal de la actividad
const ActivityScreenLevel3 = () => {
  const { treatmentId, activityId } = useParams(); // Extrae treatmentId y activityId de la ruta
  const [assignedCategories, setAssignedCategories] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Obtener información del usuario autenticado desde el estado de Redux
  const userInfo = useSelector((state) => state.auth.userInfo);
  const patientId = userInfo?._id;

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  // Iniciar el temporizador
  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Navegar de regreso después de terminar el juego
  useEffect(() => {
    if (gameFinished) {
      const timeout = setTimeout(() => {
        navigate('/api/treatments/activities');
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [gameFinished, navigate]);

  // Manejar errores de la mutación
  useEffect(() => {
    if (recordError) {
      toast.error(`Error al guardar la actividad: ${recordError.data?.message || recordError.message}`);
    }
  }, [recordError]);

  // Manejar el arrastre y soltar
  const handleDrop = (word, category) => {
    setAssignedCategories((prevAssigned) => ({
      ...prevAssigned,
      [word.id]: category.name
    }));
  };

  // Calcular y verificar respuestas
  const checkAnswers = () => {
    let correctCount = 0;

    wordsLevel3.forEach((word) => {
      if (assignedCategories[word.id] && assignedCategories[word.id] === word.category) {
        correctCount += 1;
      }
    });

    const score = (correctCount * (5 / wordsLevel3.length)).toFixed(2); // Puntaje con dos decimales
    setCorrectAnswers(score);
    setIncorrectAnswers(wordsLevel3.length - correctCount);
    setGameFinished(true);
  };

  // Guardar la actividad utilizando RTK Query
  const saveActivity = async () => {
    // Validar que el usuario está autenticado
    if (!userInfo) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Validar que treatmentId está definido
    if (!treatmentId) {
      toast.error('Tratamiento no identificado. No se puede guardar la actividad.');
      return;
    }

    // Construir el objeto de datos de la actividad
    const activityData = {
      activityId, // ID de la actividad principal desde los parámetros de la ruta
      correctAnswers: correctAnswers, // Número de respuestas correctas (puntaje)
      incorrectAnswers: incorrectAnswers, // Número de respuestas incorrectas
      timeUsed: timer,
      scoreObtained: parseFloat(correctAnswers), // Asegurar que es un número decimal
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El paciente completó la actividad de clasificación de palabras en nivel avanzado.',
      patientId, // ID del paciente desde el estado de Redux
      difficultyLevel: 3, // Nivel de dificultad
      image: '', // No hay imagen asociada en esta actividad
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      // El error será manejado por el useEffect anterior
    }
  };

  // Llamar a saveActivity cuando el juego ha finalizado
  useEffect(() => {
    if (gameFinished) {
      saveActivity();
    }
  }, [gameFinished]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="word-classification">
        <h1>Clasificación de Palabras - Nivel 3</h1>
        <p>Tiempo: {timer} segundos</p>

        <div className="categories-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
          {categoriesLevel3.map((category) => (
            <Category
              key={category.id}
              category={category}
              assignedWords={Object.keys(assignedCategories)
                .filter((wordId) => assignedCategories[wordId] === category.name)
                .map((wordId) => wordsLevel3.find((word) => word.id === parseInt(wordId)))}
              onDrop={(word) => handleDrop(word, category)}
            />
          ))}
        </div>

        <div className="words-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {wordsLevel3.filter(word => !Object.keys(assignedCategories).includes(word.id.toString())).map((word) => (
            <Word key={word.id} word={word} />
          ))}
        </div>

        {!gameFinished && (
          <button onClick={checkAnswers} className="submit-button" style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
            Enviar Respuesta
          </button>
        )}

        {gameFinished && (
          <div className="results" style={{ marginTop: '20px' }}>
            <h2>¡Juego Terminado!</h2>
            <p>Respuestas correctas: {correctAnswers} de {wordsLevel3.length}</p>
            <p>Respuestas incorrectas: {incorrectAnswers} de {wordsLevel3.length}</p>
            <p>Tiempo total: {timer} segundos</p>
            <p>Puntaje final: {correctAnswers}</p>
          </div>
        )}

        <ToastContainer />
      </div>
    </DndProvider>
  );
};

// Componente para las palabras que se pueden arrastrar
const Word = ({ word }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WORD',
    item: word,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className="word"
      style={{
        ...word.style,
        opacity: isDragging ? 0.5 : 1,
        width: '100px',
        height: word.style.clipPath ? '100px' : '50px',
        fontSize: '20px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '10px',
        cursor: 'grab'
      }}
    >
      {word.text}
    </div>
  );
};

// Componente para las categorías donde se pueden soltar las palabras
const Category = ({ category, assignedWords, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'WORD',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className="category"
      style={{
        backgroundColor: isOver ? '#f0f0f0' : 'white',
        padding: '20px',
        border: '2px dashed gray',
        minHeight: '200px',
        width: '22%', // Ajuste para cuatro categorías
        margin: '10px',
        borderRadius: '8px'
      }}
    >
      <h3>{category.name}</h3>
      <div className="assigned-words" style={{ display: 'flex', flexWrap: 'wrap' }}>
        {assignedWords.map((word) => (
          <div
            key={word.id}
            className="word"
            style={{
              ...word.style,
              width: '100px',
              height: word.style.clipPath ? '100px' : '50px',
              fontSize: '20px',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '10px'
            }}
          >
            {word.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityScreenLevel3;
