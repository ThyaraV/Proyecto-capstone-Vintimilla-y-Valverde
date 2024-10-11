import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const categories = [
  { id: 1, name: 'Colores' },
  { id: 2, name: 'Formas' }
];

const words = [
  { id: 1, text: 'Rojo', category: 'Colores' },
  { id: 2, text: 'Círculo', category: 'Formas' },
  { id: 3, text: 'Azul', category: 'Colores' },
  { id: 4, text: 'Cuadrado', category: 'Formas' },
  { id: 5, text: 'Verde', category: 'Colores' }
];

const ActivityScreen6 = () => {
  const [assignedCategories, setAssignedCategories] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  const handleDrop = (word, category) => {
    setAssignedCategories((prevAssigned) => ({
      ...prevAssigned,
      [word.id]: category.name
    }));
  };

  const checkAnswers = () => {
    let correctCount = 0;
    words.forEach((word) => {
      if (assignedCategories[word.id] === word.category) {
        correctCount += 1;
      }
    });
    setCorrectAnswers(correctCount);
    setGameFinished(true);
    saveActivity(correctCount);
  };

  const saveActivity = async (score) => {
    const activityData = {
      name: 'Clasificación de palabras',
      description: 'Actividad para clasificar palabras en categorías.',
      type: 'clasificacion_palabras',
      scoreObtained: score,
      timeUsed: timer,
      patientId: 'somePatientId' // Reemplaza con el ID real del paciente
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
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="word-classification">
        <h1>Clasificación de Palabras</h1>
        <p>Tiempo: {timer} segundos</p>

        <div className="categories-container">
          {categories.map((category) => (
            <Category
              key={category.id}
              category={category}
              assignedWords={Object.keys(assignedCategories)
                .filter((wordId) => assignedCategories[wordId] === category.name)
                .map((wordId) => words.find((word) => word.id === parseInt(wordId)))}
              onDrop={(word) => handleDrop(word, category)}
            />
          ))}
        </div>

        <div className="words-container">
          {words.filter(word => !Object.keys(assignedCategories).includes(word.id.toString())).map((word) => (
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
            <p>Respuestas correctas: {correctAnswers} de {words.length}</p>
            <p>Tiempo total: {timer} segundos</p>
          </div>
        )}

        <ToastContainer />
      </div>
    </DndProvider>
  );
};

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
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {word.text}
    </div>
  );
};

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
      style={{ backgroundColor: isOver ? '#f0f0f0' : 'white' }}
    >
      <h3>{category.name}</h3>
      <div className="assigned-words">
        {assignedWords.map((word) => (
          <div key={word.id} className="word">
            {word.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityScreen6