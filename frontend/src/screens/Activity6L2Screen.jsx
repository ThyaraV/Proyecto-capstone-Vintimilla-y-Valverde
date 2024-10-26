import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom'; 

const categoriesLevel2 = [
  { id: 1, name: 'Colores' },
  { id: 2, name: 'Formas' },
  { id: 3, name: 'Frutas' }
];

const wordsLevel2 = [
  { id: 1, text: 'Verde', category: 'Colores', style: { backgroundColor: 'green' } },
  { id: 2, text: 'Óvalo', category: 'Formas', style: { borderRadius: '50%', width: '150px', height: '100px', backgroundColor: 'gray' } },
  { id: 3, text: 'Naranja', category: 'Colores', style: { backgroundColor: 'orange' } },
  { id: 4, text: 'Rectángulo', category: 'Formas', style: { width: '150px', height: '100px', backgroundColor: 'gray' } },
  { id: 5, text: 'Manzana', category: 'Frutas', style: { backgroundColor: 'red' } },
  { id: 6, text: 'Pera', category: 'Frutas', style: { backgroundColor: 'green' } },
  { id: 7, text: 'Plátano', category: 'Frutas', style: { backgroundColor: 'yellow' } },
  { id: 8, text: 'Uva', category: 'Frutas', style: { backgroundColor: 'purple' } }
];

const ActivityScreenLevel2 = () => {
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

    wordsLevel2.forEach((word) => {
      if (assignedCategories[word.id] && assignedCategories[word.id] === word.category) {
        correctCount += 1;
      }
    });

    const score = (correctCount * (5 / wordsLevel2.length)).toFixed(2);
    setCorrectAnswers(score);
    setGameFinished(true);
    saveActivity(score);
  };

  const saveActivity = async (score) => {
    const activityData = {
      name: 'Clasificación de palabras - Nivel 2',
      description: 'Actividad para clasificar palabras en categorías. Nivel 2 con Colores, Formas y Frutas.',
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
        <h1>Clasificación de Palabras - Nivel 2</h1>
        <p>Tiempo: {timer} segundos</p>

        <div className="categories-container">
          {categoriesLevel2.map((category) => (
            <Category
              key={category.id}
              category={category}
              assignedWords={Object.keys(assignedCategories)
                .filter((wordId) => assignedCategories[wordId] === category.name)
                .map((wordId) => wordsLevel2.find((word) => word.id === parseInt(wordId)))}
              onDrop={(word) => handleDrop(word, category)}
            />
          ))}
        </div>

        <div className="words-container">
          {wordsLevel2.filter(word => !Object.keys(assignedCategories).includes(word.id.toString())).map((word) => (
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

export default ActivityScreenLevel2;
