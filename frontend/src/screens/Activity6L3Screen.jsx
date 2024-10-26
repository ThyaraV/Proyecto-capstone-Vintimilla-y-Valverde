import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom'; 

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

const ActivityScreenLevel3 = () => {
  const [assignedCategories, setAssignedCategories] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        navigate('/activities');
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [gameFinished, navigate]);

  const handleDrop = (word, category) => {
    setAssignedCategories((prevAssigned) => ({
      ...prevAssigned,
      [word.id]: category.name
    }));
  };

  const checkAnswers = () => {
    let correctCount = 0;

    wordsLevel3.forEach((word) => {
      if (assignedCategories[word.id] && assignedCategories[word.id] === word.category) {
        correctCount += 1;
      }
    });

    const score = (correctCount * (5 / wordsLevel3.length)).toFixed(2);
    setCorrectAnswers(score);
    setGameFinished(true);
    saveActivity(score);
  };

  const saveActivity = async (score) => {
    const activityData = {
      name: 'Clasificación de palabras - Nivel 3',
      description: 'Actividad para clasificar palabras en categorías. Nivel 3 con Colores, Formas, Frutas y Animales.',
      type: 'clasificacion_palabras',
      scoreObtained: score,
      timeUsed: timer,
      patientId: 'somePatientId'
    };

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        console.error('Error al guardar la actividad');
      }
    } catch (error) {
      console.error('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="word-classification">
        <h1>Clasificación de Palabras - Nivel 3</h1>
        <p>Tiempo: {timer} segundos</p>

        <div className="categories-container">
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

        <div className="words-container">
          {wordsLevel3.filter(word => !Object.keys(assignedCategories).includes(word.id.toString())).map((word) => (
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
            <p>Respuestas correctas: {correctAnswers} de 5</p>
            <p>Tiempo total: {timer} segundos</p>
          </div>
        )}
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
      style={{
        ...word.style,
        opacity: isDragging ? 0.5 : 1,
        width: '100px', 
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
      style={{
        backgroundColor: isOver ? '#f0f0f0' : 'white',
        padding: '20px',
        border: '2px dashed gray',
        minHeight: '200px',
        margin: '10px'
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
              width: '100px',
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

export default ActivityScreenLevel3;
