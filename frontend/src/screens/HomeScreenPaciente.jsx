// src/screens/HomeScreenPaciente.js
import React, { useEffect, useState } from 'react';
import '../assets/styles/HomeScreenPaciente.css';
import { useNavigate } from 'react-router-dom';
import { useGetDueMedicationsQuery, useGetMyMedicationsQuery } from '../slices/treatmentSlice.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MedicationPopup from '../components/MedicationPopup';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays } from 'date-fns';

const HomeScreenPaciente = () => {
  const navigate = useNavigate();
  const { data: dueMedications } = useGetDueMedicationsQuery();
  const { data: allMedications } = useGetMyMedicationsQuery();
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [medicationsForPopup, setMedicationsForPopup] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [medsForSelectedDate, setMedsForSelectedDate] = useState([]);

  // Mostrar notificación si hay medicamentos para hoy
  const handleToastClick = () => {
    if (dueMedications?.length > 0) {
      setMedicationsForPopup(dueMedications);
      setIsPopupOpen(true);
    }
  };

  useEffect(() => {
    if (dueMedications && dueMedications.length > 0) {
      toast.info(`Tienes ${dueMedications.length} medicamento(s) para tomar hoy. Haz clic para ver detalles.`, {
        position: "top-right",
        autoClose: false,
        closeOnClick: true,
        draggable: true,
        onClick: handleToastClick,
      });
    }
  }, [dueMedications]);

  // Generar eventos para el calendario basado en medicamentos
  useEffect(() => {
    if (allMedications) {
      const events = {};
      allMedications.forEach((med) => {
        const start = new Date(med.startDate);
        const end = med.endDate ? new Date(med.endDate) : addDays(new Date(), 365);
        let current = new Date(start);

        while (current <= end) {
          const dateKey = format(current, 'yyyy-MM-dd');
          let isDue = false;

          switch (med.frequency) {
            case 'Diaria':
              isDue = true;
              break;
            case 'Semanal':
              if (current.getDay() === start.getDay()) isDue = true;
              break;
            case 'Mensual':
              if (current.getDate() === start.getDate()) isDue = true;
              break;
            default:
              break;
          }

          if (isDue) {
            if (!events[dateKey]) events[dateKey] = [];
            events[dateKey].push(med);
          }

          // Incrementar la fecha según la frecuencia
          switch (med.frequency) {
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
              break;
          }
        }
      });
      setCalendarEvents(events);
    }
  }, [allMedications]);

  const handleDateClick = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const meds = calendarEvents[dateKey] || [];
    setSelectedDate(date);
    setMedsForSelectedDate(meds);
    setIsPopupOpen(meds.length > 0);
  };

  return (
    <div className="home-screen-container">
      <h1>Bienvenido a tu HomeScreen</h1>

      {/* Toast Container */}
      <ToastContainer />

      {/* Pop-up de Medicamentos */}
      <MedicationPopup
        isOpen={isPopupOpen}
        onRequestClose={() => setIsPopupOpen(false)}
        medications={medicationsForPopup}
      />

      {/* Calendario Interactivo */}
      <div className="calendar-container">
        <Calendar
          onClickDay={handleDateClick}
          tileContent={({ date, view }) => {
            if (view === 'month') {
              const dateKey = format(date, 'yyyy-MM-dd');
              return calendarEvents[dateKey]?.length > 0 ? <div className="dot"></div> : null;
            }
          }}
        />
      </div>

      {/* Pop-up de Detalles del Día Seleccionado */}
      {selectedDate && (
        <div className={`day-details-modal ${medsForSelectedDate.length > 0 ? 'open' : ''}`}>
          <div className="day-details-content">
            <h2>Medicamentos para {format(selectedDate, 'dd/MM/yyyy')}</h2>
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
            <button onClick={() => setSelectedDate(null)} className="close-button">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreenPaciente;
