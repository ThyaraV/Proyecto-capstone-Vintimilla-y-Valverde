import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { FaPlay, FaStop } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const FluidezVerbalActivityM = ({
  onComplete = () => {}, 
  isSpeaking,
  speakInstructions,
  onPrevious,
  isFirstModule,
  activity,
  treatmentId
}) => {
  const [timer, setTimer] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [wordList, setWordList] = useState([]);
  const [inputWord, setInputWord] = useState("");
  const [useVoice, setUseVoice] = useState(true);
  const [listening, setListening] = useState(false);
  const [currentLetter, setCurrentLetter] = useState("M"); // <-- Nueva variable de estado para la letra
  const recognitionRef = useRef(null);
  const scoreCalculatedRef = useRef(false); // Bandera para evitar doble guardado

  const userInfo = useSelector((state) => state.auth.userInfo);
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();
  const navigate = useNavigate();

  // Definir el alfabeto (puedes ajustar este arreglo según tus necesidades)
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Función para seleccionar una letra aleatoria
  const getRandomLetter = () => {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    return alphabet[randomIndex];
  };

  useEffect(() => {
    let interval = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
      clearInterval(interval);
      if (listening) handleStopListening();
      if (!scoreCalculatedRef.current) { // Verificación de la bandera
        calculateScore();
        scoreCalculatedRef.current = true; // Actualización de la bandera
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setUseVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const result = event.results[i][0].transcript.toLowerCase().trim();
          const words = result
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter((w) => w && w[0] === currentLetter.toLowerCase() && w.length > 1); // <-- Uso de currentLetter
          setWordList((prevList) => {
            const combined = [...prevList, ...words];
            return combined.filter((word, index, self) => self.indexOf(word) === index);
          });
        }
      }
    };

    recognition.onerror = () => {
      setListening(false);
      alert("Error al reconocer la voz. Intente de nuevo.");
    };

    recognition.onend = () => {
      if (listening) recognition.start();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentLetter]); // <-- Dependencia agregada

  const handleStart = () => {
    setIsRunning(true);
    scoreCalculatedRef.current = false; // Reiniciar la bandera al iniciar
    const letter = getRandomLetter();
    setCurrentLetter(letter); // Establecer la letra aleatoria
    // Opcional: Reiniciar wordList y timer si es necesario
    setWordList([]);
    setTimer(60);
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
      if (word && word[0] === currentLetter.toLowerCase() && word.length > 1) { // <-- Uso de currentLetter
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
      alert("Primero inicie el tiempo antes de hablar.");
      return;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const calculateScore = async () => {
    // Ahora correctAnswers será la cantidad de palabras dichas, no 0/1
    const validWords = wordList.filter((w) => w[0] === currentLetter.toLowerCase() && w.length > 1); // <-- Uso de currentLetter
    const correctAnswers = validWords.length;
    const incorrectAnswers = 0;
    const timeUsed = 60 - timer;
    const patientId = userInfo ? userInfo._id : null;
    const activityId = activity ? activity._id : null;

    // Construir el objeto con la cantidad real de palabras en scoreObtained
    const activityData = {
      activityId: activityId,
      correctAnswers: correctAnswers,
      incorrectAnswers: incorrectAnswers,
      timeUsed: timeUsed,
      scoreObtained: parseFloat(correctAnswers.toFixed(2)), 
      progress: 'mejorando',
      observations: 'El paciente completó la actividad de clasificación de palabras en nivel avanzado.',
      patientId: patientId,
      difficultyLevel: 1,
      image: '',
    };

    if (treatmentId && activityId && patientId) {
      try {
        await recordActivity({ treatmentId, activityData }).unwrap();
        toast.success("Actividad guardada correctamente");
      } catch (error) {
        console.error("Error al guardar la actividad:", error);
        const errorMessage = error?.data?.message || error.message || "Error desconocido";
        toast.error(`Hubo un problema al guardar la actividad: ${errorMessage}`);
      }
    } else {
      console.warn("No se pudo guardar la actividad: faltan datos (treatmentId, activityId o patientId).");
    }

    // onComplete con la cantidad de palabras
    onComplete(correctAnswers);
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Fluidez verbal - Letra {currentLetter}</h4> {/* <-- Uso de currentLetter */}
        <Button
          variant="link"
          onClick={() =>
            speakInstructions(
              `Me gustaría que me diga el mayor número posible de palabras que comiencen por la letra ${currentLetter}. Puede hablar o escribirlas. ¿Está listo? Presione el botón para iniciar.`
            )
          }
        >
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>
        Me gustaría que me diga el mayor número posible de palabras que comiencen por la letra {currentLetter}. Puede hablar o escribirlas. Presione el botón para iniciar.
      </p>
      {!isRunning ? (
        <div className="text-center">
          <Button variant="primary" onClick={handleStart}>
            Iniciar
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-3">
            <h5>Tiempo restante: {timer}s</h5>
          </div>
          <div className="d-flex justify-content-center align-items-center mb-4">
            {useVoice && !listening ? (
              <Button variant="primary" onClick={handleListen} className="me-3">
                Hablar
              </Button>
            ) : listening ? (
              <div className="d-flex align-items-center me-3">
                <Spinner animation="grow" variant="primary" className="me-2" />
                <Button variant="danger" onClick={handleStopListening}>
                  Detener
                </Button>
              </div>
            ) : null}
            <Form onSubmit={(e) => e.preventDefault()} className="d-flex">
              <Form.Control
                type="text"
                placeholder={`Escriba una palabra que comience con la letra ${currentLetter}`}
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
      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={onPrevious} disabled={isFirstModule}>
          Regresar
        </Button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default FluidezVerbalActivityM;
