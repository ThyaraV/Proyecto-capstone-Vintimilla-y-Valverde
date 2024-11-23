// src/screens/ActivityScreenLevel1.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const categoriesLevel1 = [
  { id: 1, name: 'Colores' },
  { id: 2, name: 'Formas' }
];

const wordsLevel1 = [
  { id: 1, text: 'Rojo', category: 'Colores', style: { backgroundColor: 'red' } },
  { id: 2, text: 'Círculo', category: 'Formas', style: { borderRadius: '50%', width: '100px', height: '100px', backgroundColor: 'gray' } },
  { id: 3, text: 'Azul', category: 'Colores', style: { backgroundColor: 'blue' } },
  { id: 4, text: 'Cuadrado', category: 'Formas', style: { width: '100px', height: '100px', backgroundColor: 'gray' } },
  { id: 5, text: 'Amarillo', category: 'Colores', style: { backgroundColor: 'yellow' } },
  { id: 6, text: 'Triángulo', category: 'Formas', style: { width: '0', height: '0', borderLeft: '50px solid transparent', borderRight: '50px solid transparent', borderBottom: '100px solid gray' } }
];

const ActivityScreenLevel1 = ({ activity, treatmentId }) => { // Recibe 'activity' y 'treatmentId' como props
  const [assignedCategories, setAssignedCategories] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  const userInfo = useSelector((state) => state.auth.userInfo); // Obtener información del usuario autenticado

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  // Iniciar el temporizador al montar el componente
  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        navigate('/api/treatments/activities');
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [gameFinished, navigate]);

  // Manejar el drop de una palabra en una categoría
  const handleDrop = (word, category) => {
    setAssignedCategories((prevAssigned) => ({
      ...prevAssigned,
      [word.id]: category.name
    }));
  };

  // Verificar las respuestas y calcular el puntaje
  const checkAnswers = () => {
    let correctCount = 0;

    wordsLevel1.forEach((word) => {
      // Verificamos si la categoría asignada coincide con la categoría correcta de la palabra
      if (assignedCategories[word.id] && assignedCategories[word.id] === word.category) {
        correctCount += 1;
      }
    });

    // Ajustamos el puntaje para que cada respuesta correcta valga 0.83 puntos
    const score = (correctCount * (5 / wordsLevel1.length)).toFixed(2);

    setCorrectAnswers(score); // Actualizamos el puntaje basado en la cantidad correcta

    setGameFinished(true);
    saveActivity(score); // Guardamos la actividad con el puntaje correcto
  };

  // Función para guardar la actividad en el backend dentro del tratamiento correspondiente
  const saveActivity = async (score) => {
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
      activityId: activity._id, // ID de la actividad principal
      scoreObtained: parseFloat(score), // Asegurarse de que es un número
      timeUsed: timer,
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: `El paciente clasificó correctamente ${score} palabras.`,
      // Puedes agregar más campos si es necesario
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      const errorMessage = error?.data?.message || error.message || 'Error desconocido';
      toast.error(`Hubo un problema al guardar la actividad: ${errorMessage}`);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="word-classification">
        <h1>Clasificación de Palabras - Nivel 1</h1>
        <p>Tiempo: {timer} segundos</p>

        <div className="categories-container">
          {categoriesLevel1.map((category) => (
            <Category
              key={category.id}
              category={category}
              assignedWords={Object.keys(assignedCategories)
                .filter((wordId) => assignedCategories[wordId] === category.name)
                .map((wordId) => wordsLevel1.find((word) => word.id === parseInt(wordId)))}
              onDrop={(word) => handleDrop(word, category)}
            />
          ))}
        </div>

        <div className="words-container">
          {wordsLevel1.filter(word => !Object.keys(assignedCategories).includes(word.id.toString())).map((word) => (
            <Word key={word.id} word={word} />
          ))}
        </div>

        {!gameFinished && (
          <button onClick={checkAnswers} className="submit-button">
            Enviar Respuesta
          </button>
        )}

        {gameFinished && (
          <div className="results">
            <h2>¡Juego Terminado!</h2>
            <p>Respuestas correctas: {correctAnswers} / 5</p>
            <p>Tiempo total: {timer} segundos</p>
          </div>
        )}

        {/* Mostrar estado de guardado de la actividad */}
        {isRecording && <p>Guardando actividad...</p>}
        {recordError && <p>Error: {recordError?.data?.message || recordError.message}</p>}
        
        <ToastContainer />
      </div>
    </DndProvider>
  );
};

// Componente Word
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
        width: '100px',  // Ajuste para hacer más grandes las formas y los colores
        height: word.style.borderRadius ? '100px' : '50px', // Mayor tamaño para las formas
        fontSize: '20px',  // Ajuste de tamaño de letra para que no se salga
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '10px',
        cursor: 'grab' // Indicador visual de arrastrar
      }}
    >
      {word.text}
    </div>
  );
};

// Componente Category
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
        margin: '10px',
        borderRadius: '8px'
      }}
    >
      <h3>{category.name}</h3>
      <div className="assigned-words">
        {assignedWords.map((word) => (
          <div
            key={word.id}
            className="word"
            style={{
              ...word.style,
              width: '100px',  // Mantener el tamaño cuando la palabra se asigna a la categoría
              height: word.style.borderRadius ? '100px' : '50px',
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

export default ActivityScreenLevel1;
