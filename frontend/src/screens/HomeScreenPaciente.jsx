// src/screens/HomeScreenPaciente.jsx

import React, { useEffect, useState } from 'react';
import '../assets/styles/HomeScreenPaciente.css';
import { useNavigate } from 'react-router-dom';
import {
  useGetDueMedicationsQuery,
  useGetMyMedicationsQuery,
  useGetActivitiesByUserQuery,
  useGetActiveTreatmentQuery,
  useGetCompletedActivitiesQuery,
} from '../slices/treatmentSlice.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays, isValid, differenceInDays } from 'date-fns';
import { useSaveMoodMutation } from '../slices/usersApiSlice';
import Popup from '../components/Popup.jsx';
import MedicationReminder from '../components/FloatingMessage.jsx';
import MedicationPopup from '../components/MedicationPopup.jsx';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const HomeScreenPaciente = () => {
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const userId = userInfo?._id;

  const [saveMood, { isLoading: isSavingMood, error: saveMoodError }] = useSaveMoodMutation();

  // Obtener el tratamiento activo
  const {
    data: activeTreatment,
    isLoading: isActiveTreatmentLoading,
    error: activeTreatmentError,
  } = useGetActiveTreatmentQuery(userId, {
    skip: !userId,
  });

  // Obtener actividades asignadas (solo del tratamiento activo)
  const {
    data: assignedActivities,
    isLoading: isAssignedActivitiesLoading,
    error: assignedActivitiesError,
  } = useGetActivitiesByUserQuery(undefined, {
    skip: !userId || !activeTreatment,
  });

  // Obtener medicamentos (solo del tratamiento activo)
  const {
    data: allMedications,
    isLoading: isMedLoading,
    error: medError,
  } = useGetMyMedicationsQuery(undefined, {
    skip: !userId || !activeTreatment,
  });

  // Obtener medicamentos debido (solo del tratamiento activo)
  const {
    data: dueMedications,
    isSuccess: isMedDueSuccess,
    isLoading: isMedDueLoading,
    error: medDueError,
  } = useGetDueMedicationsQuery(undefined, {
    skip: !userId || !activeTreatment,
  });

  // Obtener actividades completadas (solo del tratamiento activo)
  const {
    data: completedActivities,
    isLoading: isCompletedActivitiesLoading,
    error: completedActivitiesError,
    refetch: refetchCompletedActivities,
  } = useGetCompletedActivitiesQuery(undefined, {
    skip: !userId || !activeTreatment,
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
    { emoji: '🤩', color: '#FFD700' }, // Muy Feliz
  ];

  // Mostrar el Popup de estado de ánimo al iniciar
  useEffect(() => {
    setIsMoodPopupOpen(true);
    console.log('Mood Popup abierto (temporal)');
  }, []);

  // Actualizar la agenda cuando se cambia la fecha seleccionada
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setMedsForSelectedDate(calendarEvents[dateKey]?.medications || []);
    setActivitiesForSelectedDate(calendarEvents[dateKey]?.activities || []);

    // Si la fecha seleccionada está dentro del período del tratamiento, mostrar todas las actividades completadas
    if (activeTreatment) {
      const startDate = new Date(activeTreatment.startDate);
      const endDate = new Date(activeTreatment.endDate);

      if (selectedDate >= startDate && selectedDate <= endDate) {
        setCompletedActivitiesForSelectedDate(completedActivities || []);
      } else {
        setCompletedActivitiesForSelectedDate([]);
      }
    } else {
      setCompletedActivitiesForSelectedDate([]);
    }
  }, [selectedDate, calendarEvents, completedActivities, activeTreatment]);

  // Procesar medicamentos y actividades para el calendario
  useEffect(() => {
    if (
      activeTreatment &&
      (allMedications || isMedLoading === false) &&
      (assignedActivities || isAssignedActivitiesLoading === false) &&
      (completedActivities || isCompletedActivitiesLoading === false)
    ) {
      const events = {};

      // Crear un set de IDs de actividades completadas
      const completedActivityIds = new Set(
        completedActivities?.map((completedActivity) => completedActivity.activity._id.toString())
      );

      // Generar fechas desde startDate hasta endDate del tratamiento
      const startDate = new Date(activeTreatment.startDate);
      const endDate = new Date(activeTreatment.endDate);
      const totalDays = differenceInDays(endDate, startDate) + 1;

      for (let i = 0; i < totalDays; i++) {
        const currentDate = addDays(startDate, i);
        const dateKey = format(currentDate, 'yyyy-MM-dd');

        if (!events[dateKey]) {
          events[dateKey] = { medications: [], activities: [], completedActivities: [] };
        }

        // Agregar medicamentos programados para la fecha actual
        allMedications?.forEach((med) => {
          const medStart = new Date(med.startDate);
          const medEnd = med.endDate ? new Date(med.endDate) : addDays(new Date(), 365);

          if (currentDate >= medStart && currentDate <= medEnd) {
            const frequency = med.frequency;
            let isDue = false;

            switch (frequency) {
              case 'Diaria':
                isDue = true;
                break;
              case 'Semanal':
                if (currentDate.getDay() === medStart.getDay()) {
                  isDue = true;
                }
                break;
              case 'Mensual':
                if (currentDate.getDate() === medStart.getDate()) {
                  isDue = true;
                }
                break;
              default:
                break;
            }

            if (isDue) {
              events[dateKey].medications.push(med);
            }
          }
        });

        // Agregar actividades pendientes para la fecha actual, excluyendo las completadas
        assignedActivities?.forEach((activity) => {
          const activityIdStr = activity._id.toString();
          const isCompleted = completedActivityIds.has(activityIdStr);

          if (!isCompleted) {
            events[dateKey].activities.push(activity);
          }
        });

        // Agregar actividades completadas
        events[dateKey].completedActivities = completedActivities || [];
      }

      // Determinar si todas las actividades han sido completadas en un día
      for (const dateKey in events) {
        const dayEvents = events[dateKey];
        const totalAssigned =
          dayEvents.activities.length + completedActivityIds.size;
        const totalCompleted = completedActivityIds.size;

        dayEvents.allActivitiesCompleted = totalAssigned > 0 && totalCompleted >= totalAssigned;
      }

      setCalendarEvents(events);
      console.log('Calendar Events:', events);
    }
  }, [
    activeTreatment,
    allMedications,
    isMedLoading,
    assignedActivities,
    isAssignedActivitiesLoading,
    completedActivities,
    isCompletedActivitiesLoading,
  ]);

  // Configurar Socket.io para actualizaciones en tiempo real
  useEffect(() => {
    if (!activeTreatment || !activeTreatment._id) {
      // No hay tratamiento activo, no configurar Socket.io
      return;
    }

    // Inicializar el socket
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Conectado al servidor de Socket.io con ID:', socket.id);
    });

    // Escuchar el evento de actividades completadas
    socket.on(`treatmentActivitiesUpdated:${activeTreatment._id}`, (data) => {
      console.log(
        `Evento treatmentActivitiesUpdated recibido para el tratamiento ${activeTreatment._id}`,
        data
      );
      // Refetch de actividades completadas
      refetchCompletedActivities();
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor de Socket.io');
    });

    // Limpiar el socket al desmontar el componente o cuando activeTreatment cambie
    return () => {
      socket.disconnect();
      console.log('Socket desconectado en cleanup');
    };
  }, [activeTreatment, refetchCompletedActivities]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Manejar el clic en el mensaje de recordatorio
  const handleMedicationReminderClick = () => {
    console.log('Se hizo clic en el mensaje flotante de medicamentos.');
    if (dueMedications) {
      console.log('Medications due:', dueMedications);
      setMedicationsForPopup(dueMedications);
      setIsPopupOpen(true);
      console.log('Popup de Medicamentos abierto');
    } else {
      console.log('No hay medicamentos para mostrar en el popup.');
    }
  };

  // ** Retornos condicionales después de los Hooks **

  // Manejar el caso cuando no hay tratamiento activo
  if (isActiveTreatmentLoading) {
    return <p>Cargando tratamiento activo...</p>;
  }

  if (activeTreatmentError) {
    return (
      <p>
        Error al cargar el tratamiento activo:{' '}
        {activeTreatmentError.data?.message || activeTreatmentError.error}
      </p>
    );
  }

  if (!activeTreatment) {
    return (
      <div className="home-screen-container">
        <p>No tienes un tratamiento activo asignado actualmente.</p>
      </div>
    );
  }

  // ** Retorno principal del componente **
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
      {!isMoodPopupOpen &&
        isMedDueSuccess &&
        dueMedications &&
        dueMedications.length > 0 && (
          <MedicationReminder
            count={dueMedications.length}
            onClick={handleMedicationReminderClick}
          />
        )}

      {/* Pop-up de Medicamentos */}
      <MedicationPopup
        isOpen={isPopupOpen}
        onRequestClose={() => setIsPopupOpen(false)}
        medications={medicationsForPopup}
      />

      {/* Mostrar indicadores de carga y errores para guardar el estado de ánimo */}
      {isSavingMood && <p>Guardando tu estado de ánimo...</p>}
      {saveMoodError && (
        <p>
          Error al guardar tu estado de ánimo:{' '}
          {saveMoodError.data?.message || saveMoodError.error}
        </p>
      )}

      {/* Calendario y Agenda */}
      {!isMoodPopupOpen && (
        <div className="main-content">
          {/* Mostrar Tratamiento Activo */}
          {activeTreatment && (
            <div className="active-treatment-container">
              <h2>Tratamiento Activo</h2>
              <div>
                <strong>{activeTreatment.treatmentName}</strong>
              </div>
              <div>{activeTreatment.description}</div>
              {/* Puedes agregar más detalles según tus necesidades */}
            </div>
          )}

          {/* Agenda */}
          <div className="agenda-container">
            <h2>Agenda</h2>
            <div className="selected-date">{format(selectedDate, 'dd MMMM yyyy')}</div>
            {/* Sección de Medicamentos */}
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

            {/* Sección de Actividades Pendientes */}
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

            {/* Sección de Actividades Completadas */}
            <div className="completed-activities-list">
              <h3>Actividades Completadas</h3>
              {completedActivitiesForSelectedDate.length > 0 ? (
                <ul>
                  {completedActivitiesForSelectedDate.map((completedActivity, index) => (
                    <li key={index}>
                      <strong>{completedActivity.activity.name}</strong> -{' '}
                      {completedActivity.dateCompleted
                        ? format(
                            new Date(completedActivity.dateCompleted),
                            'dd/MM/yyyy HH:mm'
                          )
                        : 'Sin fecha'}
                      {/* Mostrar fecha y hora */}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No has completado actividades para este período.</p>
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
                  } else if (
                    calendarEvents[dateKey]?.medications.length > 0 ||
                    calendarEvents[dateKey]?.activities.length > 0 ||
                    calendarEvents[dateKey]?.completedActivities.length > 0
                  ) {
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
        <li
          style={{ '--i': '#56CCF2', '--j': '#2F80ED' }}
          onClick={() => navigate('/chat')}
        >
          <span className="icon">💬</span>
          <span className="title">Mensajes</span>
        </li>
      </ul>
    </div>
  );
};

export default HomeScreenPaciente;
