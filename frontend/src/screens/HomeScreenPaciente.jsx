// src/screens/HomeScreenPaciente.jsx

import React, { useEffect, useState } from 'react';
import '../assets/styles/HomeScreenPaciente.css';
import { useNavigate } from 'react-router-dom';
import {
  useGetDueMedicationsQuery,
  useGetMyMedicationsQuery,
  useGetActivitiesByUserQuery,
  useGetActiveTreatmentQuery,
  useGetCompletedActivitiesQuery
} from '../slices/treatmentSlice.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays, isValid } from 'date-fns';
import { useSaveMoodMutation } from '../slices/usersApiSlice';
import Popup from '../components/Popup.jsx';
import MedicationReminder from '../components/FloatingMessage.jsx';
import MedicationPopup from '../components/MedicationPopup.jsx';
import { useSelector } from 'react-redux'; // Importa useSelector

const HomeScreenPaciente = () => {
  const navigate = useNavigate();

  // ** Obtener userId desde el estado de autenticación **
  const { userInfo } = useSelector((state) => state.auth); // Ajusta según tu estructura de estado
  const userId = userInfo?._id; // Asegúrate de que _id es el campo correcto

  // ** Mutación para guardar el estado de ánimo **
  const [saveMood, { isLoading: isSavingMood, error: saveMoodError, data: saveMoodData }] = useSaveMoodMutation();

  // ** Medicamentos **
  const { data: dueMedications, isSuccess: isMedDueSuccess, isLoading: isMedDueLoading, error: medDueError } = useGetDueMedicationsQuery();
  const { data: allMedications, isLoading: isMedLoading, error: medError } = useGetMyMedicationsQuery();

  // ** Actividades Asignadas **
  const { data: assignedActivities, isSuccess: isAssignedActivitiesSuccess, isLoading: isAssignedActivitiesLoading, error: assignedActivitiesError } = useGetActivitiesByUserQuery();

  // ** Tratamiento Activo **
  const { data: activeTreatment, isSuccess: isActiveTreatmentSuccess, isLoading: isActiveTreatmentLoading, error: activeTreatmentError } = useGetActiveTreatmentQuery(userId, {
    skip: !userId, // Evita la llamada si userId no está disponible
  });

  // ** Actividades Completadas **
  const { data: completedActivities, isSuccess: isCompletedActivitiesSuccess, isLoading: isCompletedActivitiesLoading, error: completedActivitiesError } = useGetCompletedActivitiesQuery(activeTreatment?._id, {
    skip: !activeTreatment
  });

  // ** Estados de Popup **
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [medicationsForPopup, setMedicationsForPopup] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medsForSelectedDate, setMedsForSelectedDate] = useState([]);
  const [activitiesForSelectedDate, setActivitiesForSelectedDate] = useState([]);
  const [completedActivitiesForSelectedDate, setCompletedActivitiesForSelectedDate] = useState([]);

  // Estados para el Popup de Estado de Ánimo
  const [isMoodPopupOpen, setIsMoodPopupOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  // Definir los estados de ánimo disponibles
  const moods = [
    { emoji: '😠', color: '#FF4500' }, // Enojado
    { emoji: '🤢', color: '#FF69B4' }, // Enfermo
    { emoji: '😢', color: '#1E90FF' }, // Triste
    { emoji: '😴', color: '#8A2BE2' }, // Cansado
    { emoji: '🤔', color: '#FF8C00' }, // Pensativo
    { emoji: '😎', color: '#32CD32' }, // Relajado 
    { emoji: '😊', color: '#FFD700' }, // Feliz
    { emoji: '🤩', color: '#FFD700' }, // Feliz
  ];

  // ** Logear los datos recibidos de las consultas **
  useEffect(() => {
    console.log("Due Medications:", dueMedications);
  }, [dueMedications]);

  useEffect(() => {
    console.log("All Medications:", allMedications);
  }, [allMedications]);

  useEffect(() => {
    console.log("Assigned Activities:", assignedActivities);
  }, [assignedActivities]);

  useEffect(() => {
    console.log("Active Treatment:", activeTreatment);
  }, [activeTreatment]);

  useEffect(() => {
    console.log("Completed Activities:", completedActivities);
  }, [completedActivities]);

  // ** Mostrar el Popup de estado de ánimo al iniciar **
  useEffect(() => {
    setIsMoodPopupOpen(true);
    console.log('Mood Popup abierto (temporal)');
  }, []);

  // Log del estado para depuración
  console.log('isMoodPopupOpen:', isMoodPopupOpen);

  // ** Actualizar la agenda cuando se cambia la fecha seleccionada **
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setMedsForSelectedDate(calendarEvents[dateKey]?.medications || []);
    setActivitiesForSelectedDate(calendarEvents[dateKey]?.activities || []);
    setCompletedActivitiesForSelectedDate(calendarEvents[dateKey]?.completedActivities || []);
  }, [selectedDate, calendarEvents]);

  // ** Mostrar el mensaje de recordatorio de medicamentos después de cerrar el popup de estado de ánimo **
  useEffect(() => {
    if (!isMoodPopupOpen && isMedDueSuccess && dueMedications && dueMedications.length > 0) {
      console.log("Mostrando mensaje de recordatorio de medicamentos:", dueMedications);
      // Aquí no usamos toast, así que solo controlamos el estado para mostrar el mensaje
    }
  }, [isMoodPopupOpen, dueMedications, isMedDueSuccess]);

  // ** Procesar medicamentos y actividades para el calendario **
  useEffect(() => {
    if (
      (allMedications || isMedLoading === false) &&
      (assignedActivities || isAssignedActivitiesLoading === false) &&
      (completedActivities || isCompletedActivitiesLoading === false)
    ) {
      const events = {};

      // ** Crear un mapa de actividades completadas por fecha y por ID de actividad **
      const completedActivitiesMap = {};

      completedActivities?.forEach((completedActivity) => {
        const completionDate = new Date(completedActivity.dateCompleted);
        if (!isValid(completionDate)) {
          console.warn(`Fecha de completado inválida para la actividad: ${completedActivity.activity.name}. dateCompleted: ${completedActivity.dateCompleted}`);
          return;
        }
        const dateKey = format(completionDate, 'yyyy-MM-dd');
        if (!completedActivitiesMap[dateKey]) {
          completedActivitiesMap[dateKey] = new Set();
        }
        completedActivitiesMap[dateKey].add(completedActivity.activity.toString());
      });

      // ** Procesar Medicamentos **
      allMedications?.forEach((med) => {
        const start = new Date(med.startDate);
        const end = med.endDate ? new Date(med.endDate) : addDays(new Date(), 365); // Asumimos un año si no hay fecha de fin

        if (!isValid(start) || !isValid(end)) {
          console.warn(`Fecha inválida para el medicamento: ${med.name}. startDate: ${med.startDate}, endDate: ${med.endDate}`);
          return; // Saltar este medicamento si las fechas no son válidas
        }

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
              events[dateKey] = { medications: [], activities: [], completedActivities: [] };
            }
            events[dateKey].medications.push(med);
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

      // ** Procesar Actividades Asignadas **
      assignedActivities?.forEach((activity) => {
        // Asumimos que cada actividad tiene una fecha de vencimiento, de lo contrario, usa una fecha predeterminada o ignora
        const dueDate = new Date(activity.dueDate || activity.assignedDate || Date.now());

        if (!isValid(dueDate)) {
          console.warn(`Fecha inválida para la actividad: ${activity.name}. dueDate: ${activity.dueDate}, assignedDate: ${activity.assignedDate}`);
          return; // Saltar esta actividad si la fecha no es válida
        }

        const dateKey = format(dueDate, 'yyyy-MM-dd');

        if (!events[dateKey]) {
          events[dateKey] = { medications: [], activities: [], completedActivities: [] };
        }

        // Verificar si la actividad ha sido completada en esta fecha
        const activityIdStr = activity._id.toString(); // Asegúrate de que _id está disponible
        const isCompleted = completedActivitiesMap[dateKey]?.has(activityIdStr);

        if (!isCompleted) {
          events[dateKey].activities.push(activity);
        }
      });

      // ** Procesar Actividades Completadas **
      completedActivities?.forEach((completedActivity) => {
        const completionDate = new Date(completedActivity.dateCompleted);

        if (!isValid(completionDate)) {
          console.warn(`Fecha de completado inválida para la actividad: ${completedActivity.activity.name}. dateCompleted: ${completedActivity.dateCompleted}`);
          return; // Saltar esta actividad completada si la fecha no es válida
        }

        const dateKey = format(completionDate, 'yyyy-MM-dd');

        if (!events[dateKey]) {
          events[dateKey] = { medications: [], activities: [], completedActivities: [] };
        }

        events[dateKey].completedActivities.push(completedActivity);
      });

      // ** Determinar si todas las actividades han sido completadas en un día **
      for (const dateKey in events) {
        const dayEvents = events[dateKey];
        const totalAssigned = dayEvents.activities.length + (completedActivitiesMap[dateKey]?.size || 0);
        const totalCompleted = dayEvents.completedActivities.length;

        dayEvents.allActivitiesCompleted = totalAssigned > 0 && totalCompleted >= totalAssigned;
      }

      setCalendarEvents(events);
      console.log("Calendar Events:", events);
    }
  }, [
    allMedications,
    isMedLoading,
    assignedActivities,
    isAssignedActivitiesLoading,
    completedActivities,
    isCompletedActivitiesLoading
  ]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // ** Manejar el clic en el mensaje de recordatorio **
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
            
            // Enviar el estado de ánimo al servidor usando la mutación de Redux
            saveMood(mood.emoji)
              .unwrap()
              .then((response) => {
                console.log('Estado de ánimo guardado:', response);
                // Opcional: mostrar una notificación de éxito
              })
              .catch((error) => {
                console.error('Error al guardar el estado de ánimo:', error);
                // Opcional: mostrar una notificación de error
              });
          }}
        />
      )}

      {/* Mostrar el mensaje de recordatorio si el popup de estado de ánimo está cerrado y hay medicamentos debido */}
      {!isMoodPopupOpen && isMedDueSuccess && dueMedications && dueMedications.length > 0 && (
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

      {/* Mostrar indicadores de carga y errores para guardar el estado de ánimo */}
      {isSavingMood && <p>Guardando tu estado de ánimo...</p>}
      {saveMoodError && <p>Error al guardar tu estado de ánimo: {saveMoodError.data?.message || saveMoodError.error}</p>}

      {/* Calendario y Agenda */}
      {!isMoodPopupOpen && (
        <div className="main-content">
          {/* Agenda */}
          <div className="agenda-container">
            <h2>Agenda</h2>
            <div className="selected-date">
              {format(selectedDate, 'dd MMMM yyyy')}
            </div>
            {/* ** Sección de Medicamentos ** */}
            <div className="medications-list">
              <h3>Medicamentos</h3>
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

            {/* ** Sección de Actividades Pendientes ** */}
            <div className="activities-list">
              <h3>Actividades Pendientes</h3>
              {activitiesForSelectedDate.length > 0 ? (
                <ul>
                  {activitiesForSelectedDate.map((activity, index) => (
                    <li key={index}>
                      <strong>{activity.name}</strong> - {activity.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tienes actividades pendientes para este día.</p>
              )}
            </div>

            {/* ** Sección de Actividades Completadas ** */}
            <div className="completed-activities-list">
              <h3>Actividades Completadas</h3>
              {completedActivitiesForSelectedDate.length > 0 ? (
                <ul>
                  {completedActivitiesForSelectedDate.map((completedActivity, index) => (
                    <li key={index}>
                      <strong>{completedActivity.activity.name}</strong> - {completedActivity.dateCompleted ? format(new Date(completedActivity.dateCompleted), 'HH:mm') : 'Sin hora'}
                      {/* Puedes agregar más detalles si es necesario */}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No has completado actividades para este día.</p>
              )}
            </div>
          </div>

          {/* Calendario */}
          <div className="calendar-container">
            <Calendar
              onClickDay={handleDateClick}
              value={selectedDate}
              tileContent={({ date, view }) => {
                if (view === 'month') {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  if (calendarEvents[dateKey]?.allActivitiesCompleted) {
                    return <div className="dot green"></div>;
                  } else if (calendarEvents[dateKey]?.medications.length > 0 || calendarEvents[dateKey]?.activities.length > 0 || calendarEvents[dateKey]?.completedActivities.length > 0) {
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
