import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useRecordActivityMutation } from '../slices/treatmentSlice';
import { useSelector } from 'react-redux';
import { Button, Form, Spinner } from 'react-bootstrap';

const ActivityScreen9 = ({ activity, treatmentId }) => {
  const [timer, setTimer] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [wordList, setWordList] = useState([]);
  const [inputWord, setInputWord] = useState("");
  const [useVoice, setUseVoice] = useState(true);
  const [listening, setListening] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [score, setScore] = useState(null);
  const [timeUsed, setTimeUsed] = useState(0);

  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const userInfo = useSelector((state) => state.auth.userInfo);
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  useEffect(() => {
    window.scrollTo(0,0);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && isRunning) {
      handleStopListening();
      setIsRunning(false);
      endGame();
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Este navegador no soporta SpeechRecognition");
      setUseVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      console.log("Reconocimiento de voz iniciado");
    };

    recognition.onresult = (event) => {
      console.log("onresult disparado");
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const result = event.results[i][0].transcript.toLowerCase().trim();
          console.log("Texto reconocido:", result);
          const words = result
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter((w) => w && w[0] === "m" && w.length > 1);

          console.log("Palabras filtradas con M:", words);

          if (words.length > 0) {
            setWordList((prevList) => {
              const combined = [...prevList, ...words];
              return combined.filter((word, index, self) => self.indexOf(word) === index);
            });
          }
        }
      }
    };

    recognition.onerror = (e) => {
      console.error("Error en reconocimiento de voz:", e);
      if (listening && isRunning) {
        toast.error("Error al reconocer la voz. Intente nuevamente.");
      }
    };

    recognition.onend = () => {
      console.log("Reconocimiento de voz finalizado");
      // Si sigue la actividad en curso y estamos en modo listening, reiniciamos
      if (listening && isRunning) {
        console.log("Reiniciando reconocimiento continuo...");
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isRunning, listening]);

  const handleStart = () => {
    if (gameFinished) return;
    setIsRunning(true);
    setTimer(60);
    setWordList([]);
    setScore(null);
    setTimeUsed(0);
  };

  const handleInputChange = (e) => {
    setInputWord(e.target.value);
  };

  const handleAddWord = () => {
    if (inputWord.trim()) {
      const word = inputWord
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
      if (word && word[0] === "m" && word.length > 1) {
        setWordList((prevList) =>
          [...prevList, word].filter(
            (w, idx, arr) => arr.indexOf(w) === idx
          )
        );
      }
      setInputWord("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddWord();
    }
  };

  const handleListen = () => {
    if (!recognitionRef.current) {
      alert("Reconocimiento de voz no disponible.");
      return;
    }
    if (!isRunning) {
      alert("Primero inicie la actividad antes de hablar.");
      return;
    }
    setListening(true);
    console.log("Iniciando reconocimiento de voz...");
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const endGame = () => {
    const validWords = wordList.filter((w) => w[0] === "m" && w.length > 1);
    const finalScore = validWords.length >= 11 ? 1 : 0;
    setScore(finalScore);
    setGameFinished(true);

    const totalTimeUsed = 60 - timer;
    setTimeUsed(totalTimeUsed);

    saveActivity(finalScore, totalTimeUsed);

    toast.success("Actividad finalizada. Se han guardado los resultados.");
    setTimeout(() => {
      navigate('/api/treatments/activities');
    }, 6000);
  };

  const saveActivity = async (finalScore, timeUsed) => {
    if (!userInfo) {
      toast.error('Usuario no autenticado');
      return;
    }
    if (!treatmentId) {
      toast.error('Tratamiento no identificado. No se puede guardar la actividad.');
      return;
    }

    const activityData = {
      activityId: activity._id, 
      scoreObtained: finalScore,
      timeUsed: parseFloat(timeUsed),
      progress: 'mejorando',
      observations: 'El usuario completó la actividad de fluidez verbal con la letra M.'
    };

    try {
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
    <div className="module-container">
      <h1>Fluidez Verbal - Letra M</h1>
      {!isRunning && !gameFinished && (
        <div className="text-center">
          <p>Me gustaría que me diga el mayor número posible de palabras que comiencen por la letra M. Puede hablar o escribirlas. Presione el botón para iniciar.</p>
          <Button variant="primary" onClick={handleStart}>Iniciar</Button>
        </div>
      )}

      {isRunning && (
        <>
          <div className="text-center mb-3">
            <h5>Tiempo restante: {timer}s</h5>
          </div>
          <div className="d-flex justify-content-center align-items-center mb-4">
            {useVoice && !listening ? (
              <Button variant="primary" onClick={handleListen} className="me-3">
                Hablar
              </Button>
            ) : null}
            {listening && (
              <div className="d-flex align-items-center me-3">
                <Spinner animation="grow" variant="primary" className="me-2" />
                <Button variant="danger" onClick={handleStopListening}>
                  Detener
                </Button>
              </div>
            )}
            <Form onSubmit={(e) => e.preventDefault()} className="d-flex">
              <Form.Control
                type="text"
                placeholder="Escriba una palabra"
                value={inputWord}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
              <Button
                variant="success"
                onClick={handleAddWord}
                className="ms-2"
              >
                Agregar
              </Button>
            </Form>
          </div>
          <div>
            <h5>Palabras registradas:</h5>
            <ul>
              {wordList.map((word, index) => (
                <li key={index}>{word}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {gameFinished && (
        <div className="results text-center mt-4">
          <h2>¡Actividad Terminada!</h2>
          <p>Puntaje: {score} / 1</p>
          <p>Tiempo utilizado: {timeUsed} segundos</p>
          <p>Serás redirigido en breve...</p>
        </div>
      )}

      {isRecording && <p>Guardando actividad...</p>}
      {recordError && <p>Error: {recordError?.data?.message || recordError.message}</p>}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen9;
