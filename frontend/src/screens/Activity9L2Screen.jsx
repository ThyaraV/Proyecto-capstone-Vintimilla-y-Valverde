import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { FaPlay, FaStop } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const FluidezVerbalActivityLevel2 = ({
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
  const [currentPrefix, setCurrentPrefix] = useState("AC"); // Inicialización con una combinación válida
  const recognitionRef = useRef(null);
  const scoreCalculatedRef = useRef(false); // Bandera para evitar doble guardado

  const userInfo = useSelector((state) => state.auth.userInfo);
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();
  const navigate = useNavigate();

  // Definir un arreglo de combinaciones de dos letras válidas en español
  const twoLetterCombinations = [
    "AC", "AD", "AL", "AM", "AN", "AR", "BA", "BE", "BI", "BO",
    "CA", "CE", "CI", "CO", "DA", "DE", "DI", "DO", "EL", "EN",
    "ER", "ES", "FA", "FE", "FI", "FO", "GA", "GE", "GI", "GO",
    "HA", "HE", "HI", "HO", "JA", "JE", "JI", "JO", "LA", "LE",
    "LI", "LO", "LU", "MA", "ME", "MI", "MO", "MU", "NA", "NE",
    "NI", "NO", "NU", "OL", "OM", "ON", "OR", "PA", "PE", "PI",
    "PO", "PU", "QU", "RA", "RE", "RI", "RO", "RU", "SA", "SE",
    "SI", "SO", "SU", "TA", "TE", "TI", "TO", "TU", "UL", "UM",
    "UN", "UR", "VA", "VE", "VI", "VO", "YA", "YE", "YO", "YU"
    // Agrega más combinaciones válidas según sea necesario
  ];

  // Función para seleccionar una combinación de dos letras aleatoria
  const getRandomPrefix = () => {
    const randomIndex = Math.floor(Math.random() * twoLetterCombinations.length);
    return twoLetterCombinations[randomIndex];
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
  }, [isRunning, timer, listening]);

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
            .replace(/[^a-z0-9\sÑñ]/g, "") // Incluir la letra 'Ñ'
            .split(/\s+/)
            .filter((w) => w && w.startsWith(currentPrefix.toLowerCase()) && w.length > 1); // Uso de currentPrefix
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
  }, [currentPrefix]); // Dependencia agregada

  const handleStart = () => {
    setIsRunning(true);
    scoreCalculatedRef.current = false; // Reiniciar la bandera al iniciar
    const prefix = getRandomPrefix();
    setCurrentPrefix(prefix); // Establecer la combinación aleatoria
    setWordList([]); // Reiniciar la lista de palabras
    setTimer(60); // Reiniciar el temporizador
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
        .replace(/[^a-z0-9\sÑñ]/g, "") // Incluir la letra 'Ñ'
        .trim();
      if (word.startsWith(currentPrefix.toLowerCase()) && word.length > 1) { // Uso de currentPrefix
        setWordList((prevList) =>
          [...prevList, word].filter(
            (w, idx, arr) => arr.indexOf(w) === idx
          )
        );
      } else {
        // Mostrar una advertencia si la palabra no cumple con el prefijo
        toast.warn(`La palabra "${word}" no comienza con "${currentPrefix}".`);
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
    // Filtrar palabras válidas que comienzan con la combinación de dos letras
    const validWords = wordList.filter((w) => 
      w.startsWith(currentPrefix.toLowerCase()) && 
      w.length > 1
    );
    const correctAnswers = validWords.length;
    const incorrectAnswers = 0; // Puedes ajustar esto si tienes lógica para respuestas incorrectas
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
      difficultyLevel: 2,
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
        <h4>
          Fluidez verbal - Combinación "{currentPrefix}" {/* Mostrar la combinación de dos letras */}
        </h4>
        <Button
          variant="link"
          onClick={() =>
            speakInstructions(
              `Me gustaría que me diga el mayor número posible de palabras que comiencen por la combinación "${currentPrefix}". Puede hablar o escribirlas. ¿Está listo? Presione el botón para iniciar.`
            )
          }
        >
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>
        Me gustaría que me diga el mayor número posible de palabras que comiencen por la combinación "{currentPrefix}". Puede hablar o escribirlas. Presione el botón para iniciar.
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
                placeholder={`Escriba una palabra que comience con "${currentPrefix}"`}
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

export default FluidezVerbalActivityLevel2;
