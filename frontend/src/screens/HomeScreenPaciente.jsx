// src/screens/HomeScreenPaciente.js

import React, { useEffect, useState } from 'react';
import '../assets/styles/HomeScreenPaciente.css';
import { useNavigate } from 'react-router-dom';
import { useGetDueMedicationsQuery, useGetMyMedicationsQuery } from '../slices/treatmentSlice.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays } from 'date-fns';
import axios from 'axios';
import Popup from '../components/Popup.jsx';
import MedicationReminder from '../components/FloatingMessage.jsx';
import MedicationPopup from '../components/MedicationPopup.jsx'; // Asegúrate de importar correctamente

const HomeScreenPaciente = () => {
  const navigate = useNavigate();
  const { data: dueMedications, isLoading, isSuccess, error } = useGetDueMedicationsQuery();
  const { data: allMedications, isLoading: isMedLoading, error: medError } = useGetMyMedicationsQuery();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [medicationsForPopup, setMedicationsForPopup] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medsForSelectedDate, setMedsForSelectedDate] = useState([]);

  // Estados para el Popup de Estado de Ánimo
  const [isMoodPopupOpen, setIsMoodPopupOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  // Definir los estados de ánimo disponibles
  const moods = [
    { emoji: '😊', color: '#FFD700' }, // Feliz
    { emoji: '😢', color: '#1E90FF' }, // Triste
    { emoji: '😠', color: '#FF4500' }, // Enojado
    { emoji: '😴', color: '#8A2BE2' }, // Cansado
    { emoji: '😎', color: '#32CD32' }, // Relajado
    { emoji: '🤢', color: '#FF69B4' }, // Enfermo
    { emoji: '😇', color: '#00CED1' }, // Contento
    { emoji: '🤔', color: '#FF8C00' }, // Pensativo
  ];

  // Logear los datos recibidos de las consultas
  useEffect(() => {
    console.log("Due Medications:", dueMedications);
  }, [dueMedications]);

  useEffect(() => {
    console.log("All Medications:", allMedications);
  }, [allMedications]);

  // Mostrar el Popup de estado de ánimo al iniciar, temporalmente sin sessionStorage
  useEffect(() => {
    setIsMoodPopupOpen(true);
    console.log('Mood Popup abierto (temporal)');
  }, []);

  // Log del estado para depuración
  console.log('isMoodPopupOpen:', isMoodPopupOpen);

  // Actualizar la agenda cuando se cambia la fecha seleccionada
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const meds = calendarEvents[dateKey] || [];
    setMedsForSelectedDate(meds);
  }, [selectedDate, calendarEvents]);

  // Mostrar el mensaje de recordatorio de medicamentos después de cerrar el popup de estado de ánimo
  useEffect(() => {
    if (!isMoodPopupOpen && isSuccess && dueMedications && dueMedications.length > 0) {
      console.log("Mostrando mensaje de recordatorio de medicamentos:", dueMedications);
      // Aquí no usamos toast, así que solo controlamos el estado para mostrar el mensaje
    }
  }, [isMoodPopupOpen, dueMedications, isSuccess]);

  useEffect(() => {
    if (allMedications) {
      const events = {};

      allMedications.forEach(med => {
        const start = new Date(med.startDate);
        const end = med.endDate ? new Date(med.endDate) : addDays(new Date(), 365); // Asumimos un año si no hay fecha de fin
        let current = new Date(start);

        while (current <= end) {
          const dateKey = format(current, 'yyyy-MM-dd');
          const frequency = med.frequency;

          let isDue = false;

          switch (frequency) {
            case 'Diaria':
              isDue = true;
              break;
            case 'Semanal':
              if (current.getDay() === start.getDay()) {
                isDue = true;
              }
              break;
            case 'Mensual':
              if (current.getDate() === start.getDate()) {
                isDue = true;
              }
              break;
            default:
              break;
          }

          if (isDue) {
            if (!events[dateKey]) {
              events[dateKey] = [];
            }
            events[dateKey].push(med);
          }

          // Incrementar la fecha según la frecuencia
          switch (frequency) {
            case 'Diaria':
              current = addDays(current, 1);
              break;
            case 'Semanal':
              current = addDays(current, 7);
              break;
            case 'Mensual':
              current.setMonth(current.getMonth() + 1);
              break;
            default:
              current = addDays(current, 1);
              break;
          }
        }
      });

      setCalendarEvents(events);
      console.log("Calendar Events:", events);
    }
  }, [allMedications]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Manejar el clic en el mensaje de recordatorio
  const handleMedicationReminderClick = () => {
    console.log("Se hizo clic en el mensaje flotante de medicamentos.");
    if (dueMedications) {
      console.log("Medications due:", dueMedications);
      setMedicationsForPopup(dueMedications);
      setIsPopupOpen(true);
      console.log("Popup de Medicamentos abierto");
    } else {
      console.log("No hay medicamentos para mostrar en el popup.");
    }
  };

  return (
    <div className="home-screen-container">
      
      {/* Popup de Estado de Ánimo */}
      {isMoodPopupOpen && (
        <Popup
          moods={moods}
          setSelectedMood={(mood) => {
            console.log('Estado de ánimo seleccionado:', mood);
            setSelectedMood(mood);
            setIsMoodPopupOpen(false);
            // Opcional: enviar el estado de ánimo al servidor
            axios.post('/api/user/mood', { mood: mood.emoji })
              .then(response => {
                console.log('Estado de ánimo guardado:', response.data);
              })
              .catch(error => {
                console.error('Error al guardar el estado de ánimo:', error);
              });
          }}
        />
      )}

      {/* Mostrar el mensaje de recordatorio si el popup de estado de ánimo está cerrado y hay medicamentos debido */}
      {!isMoodPopupOpen && isSuccess && dueMedications && dueMedications.length > 0 && (
        <MedicationReminder count={dueMedications.length} onClick={handleMedicationReminderClick} />
      )}

      {/* Pop-up de Medicamentos */}
      {console.log("isPopupOpen:", isPopupOpen)}
      {console.log("medicationsForPopup:", medicationsForPopup)}
      <MedicationPopup
        isOpen={isPopupOpen}
        onRequestClose={() => setIsPopupOpen(false)}
        medications={medicationsForPopup}
      />

      {/* Calendario y Agenda */}
      {!isMoodPopupOpen && (
        <div className="main-content">
          {/* Agenda */}
          <div className="agenda-container">
            <h2>Agenda</h2>
            <div className="selected-date">
              {format(selectedDate, 'dd MMMM yyyy')}
            </div>
            <div className="medications-list">
              {medsForSelectedDate.length > 0 ? (
                <ul>
                  {medsForSelectedDate.map((med, index) => (
                    <li key={index}>
                      <strong>{med.name}</strong> - {med.dosage}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tienes medicamentos programados para este día.</p>
              )}
            </div>
            {/* Puedes agregar más elementos a la agenda aquí, como tareas pendientes */}
          </div>

          {/* Calendario */}
          <div className="calendar-container">
            <Calendar
              onClickDay={handleDateClick}
              value={selectedDate}
              tileContent={({ date, view }) => {
                if (view === 'month') {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  if (calendarEvents[dateKey] && calendarEvents[dateKey].length > 0) {
                    return <div className="dot"></div>;
                  }
                }
                return null;
              }}
              className="custom-calendar"
            />
          </div>
        </div>
      )}

      {/* Icono de mensajes */}
      <ul className="message-icon-container">
        <li style={{ "--i": "#56CCF2", "--j": "#2F80ED" }} onClick={() => navigate('/chat')}>
          <span className="icon">💬</span>
          <span className="title">Mensajes</span>
        </li>
      </ul>
    </div>
  );
};

export default HomeScreenPaciente;
