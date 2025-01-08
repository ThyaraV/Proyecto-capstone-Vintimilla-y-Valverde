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
/*IMPORTACIONES PARA CALENDARIO GRANDE*/
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/es'; // Importa el idioma español
import { startOfDay } from 'date-fns';

moment.locale('es');
const localizer = momentLocalizer(moment);

const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango.',
  showMore: (total) => `+ Ver más (${total})`,
};

const HomeScreenPaciente = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
  } = useGetDueMedicationsQuery(activeTreatment?._id, { // Pasa treatmentId aquí
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

  // Añadir log para verificar treatmentId
  useEffect(() => {
    if (activeTreatment) {
      console.log('Treatment ID en ParentComponent:', activeTreatment._id);
    }
  }, [activeTreatment]);

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

  const isLoading =
    isActiveTreatmentLoading ||
    isAssignedActivitiesLoading ||
    isMedLoading ||
    isCompletedActivitiesLoading;

  // Procesar medicamentos y actividades para el calendario
  useEffect(() => {
    if (
      !isLoading && activeTreatment &&
      (allMedications || isMedLoading === false) &&
      (assignedActivities || isAssignedActivitiesLoading === false) &&
      (completedActivities || isCompletedActivitiesLoading === false)
    ) {
      const tempEvents = [];

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

        // Procesar medicamentos
        allMedications?.forEach((med) => {
          const medStart = new Date(med.startDate);
          const medEnd = med.endDate ? new Date(med.endDate) : addDays(new Date(), 365);

          if (!isNaN(medStart) && !isNaN(medEnd)) {
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
                tempEvents.push({
                  title: `Medicamento: ${med.name}`,
                  start: currentDate,
                  end: currentDate,
                  allDay: true,
                  type: 'medication',
                });
              }
            }
          }
        });

        // Procesar actividades pendientes
        assignedActivities?.forEach((activity) => {
          const activityIdStr = activity._id.toString();
          const isCompleted = completedActivityIds.has(activityIdStr);

          if (!isCompleted) {
            tempEvents.push({
              title: `Pendiente: ${activity.name}`,
              start: startOfDay(currentDate),
              end: startOfDay(currentDate),
              allDay: true,
              type: 'pending',
            });
          }
        });
      }

      // Agregar actividades completadas
      completedActivities?.forEach((completedActivity) => {
        if (completedActivity?.activity?.name && completedActivity.dateCompleted) {
          const completedDate = startOfDay(new Date(completedActivity.dateCompleted));
          tempEvents.push({
            title: `Completada: ${completedActivity.activity.name}`,
            start: completedDate,
            end: completedDate,
            allDay: true,
            type: 'completed',
          });
        }
      });

      setEvents(tempEvents);
      console.log('Eventos procesados para BigCalendar:', tempEvents);
    }
  }, [
    isLoading,
    activeTreatment,
    allMedications,
    isMedLoading,
    assignedActivities,
    isAssignedActivitiesLoading,
    completedActivities,
    isCompletedActivitiesLoading,
  ]);

  useEffect(() => {
    if (calendarEvents) {
      const eventArray = [];
      Object.entries(calendarEvents).forEach(([date, data]) => {
        if (data) {
          data.medications?.forEach((med) => {
            if (med?.name) {
              console.log(`Procesando medicamento para BigCalendar:`, med, `Fecha:`, date);
              const parsedDate = new Date(date);
              if (!isNaN(parsedDate)) {
                eventArray.push({
                  title: `Medicamento: ${med.name}`,
                  start: parsedDate,
                  end: parsedDate,
                  allDay: true,
                  type: 'medication',
                });
              }
            }
          });

          data.activities?.forEach((activity) => {
            if (activity?.name) {
              eventArray.push({
                title: `Pendiente: ${activity.name}`,
                start: new Date(date),
                end: new Date(date),
                allDay: true,
                type: 'pending',
              });
            }
          });

          data.completedActivities?.forEach((completedActivity) => {
            if (completedActivity?.activity?.name && completedActivity.dateCompleted) {
              const completedDate = new Date(completedActivity.dateCompleted);
              const normalizedDateKey = format(startOfDay(completedDate), 'yyyy-MM-dd'); // Normalizar fecha

              if (!events[normalizedDateKey]) {
                events[normalizedDateKey] = { medications: [], activities: [], completedActivities: [] };
              }

              events[normalizedDateKey].completedActivities.push(completedActivity);

              console.log(
                `Procesando actividad completada:`,
                completedActivity.activity.name,
                `Fecha completada:`,
                completedActivity.dateCompleted,
                `Fecha normalizada:`,
                normalizedDateKey
              );
            }
          });
        }
      });
      setEvents(eventArray);
    }
  }, [calendarEvents]);

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
      // Filtrar medicamentos que NO han sido tomados hoy
      const pendingMeds = dueMedications.filter(med => !med.takenToday);
      setMedicationsForPopup(pendingMeds);
      setIsPopupOpen(true);
      console.log('Popup de Medicamentos abierto con medicamentos pendientes:', pendingMeds);
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

  console.log('Validando cada evento:');
  events.forEach((event, index) => {
    if (!event.title) {
      console.error(`Evento en índice ${index} no tiene título:`, event);
    }
    if (!(event.start instanceof Date) || isNaN(event.start)) {
      console.error(`La propiedad 'start' no es válida en el evento ${index}:`, event.start);
    }
    if (!(event.end instanceof Date) || isNaN(event.end)) {
      console.error(`La propiedad 'end' no es válida en el evento ${index}:`, event.end);
    }
  });

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

      <h2>Calendario de Actividades</h2>
      <BigCalendar
        localizer={localizer}
        events={events} // Garantizar que siempre sea un array
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        messages={messages}
        eventPropGetter={(event) => {
          const backgroundColor =
            event.type === 'medication'
              ? '#FFD700'
              : event.type === 'completed'
              ? '#32CD32'
              : '#FF6347';
          return { style: { backgroundColor, color: '#ffffff', borderRadius: '5px', padding: '5px' } };
        }}
        onSelectEvent={(event) => {
          console.log('Evento seleccionado:', event);
          setSelectedEvent(event);
          setIsEventPopupOpen(true);
        }}
        popup
        showAllEvents={false} // Permite forzar la opción de ver más
        components={{
          event: ({ event }) => <span>{event.title}</span>,
          agenda: {
            event: ({ event }) => (
              <div className="custom-popup-scroll">
                <span>{event.title}</span>
              </div>
            ),
          },
        }}
      />

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
        treatmentId={activeTreatment._id} // Asegúrate de pasar el treatmentId aquí
      />

      {/* Mostrar indicadores de carga y errores para guardar el estado de ánimo */}
      {isSavingMood && <p>Guardando tu estado de ánimo...</p>}
      {saveMoodError && (
        <p>
          Error al guardar tu estado de ánimo:{' '}
          {saveMoodError.data?.message || saveMoodError.error}
        </p>
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
