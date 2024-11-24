// src/screens/ActivityPlay.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetActivityByIdQuery } from '../slices/activitiesSlice.js'; // Asumiendo que tienes un slice para actividades
import ActivityScreen1 from '../screens/ActivityScreen1';
import ActivityScreen2 from '../screens/ActivityScreen2';
import ActivityScreen3 from '../screens/ActivityScreen3';
import ActivityScreen4 from '../screens/ActivityScreen4.jsx';
import ActivityScreen5 from '../screens/ActivityScreen5.jsx';
import ActivityScreen6 from '../screens/ActivityScreen6.jsx';
import ActivityScreen7 from '../screens/ActivityScreen7.jsx';
import ActivityScreen8 from '../screens/ActivityScreen8.jsx';
import ActivityScreen9 from '../screens/ActivityScreen9.jsx';
import ActivityScreen10 from '../screens/ActivityScreen10.jsx';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { ACTIVITY_TYPES, ACTIVITY_LEVELS } from '../constants'; // Importar constantes

const activityComponents = {
  [ACTIVITY_TYPES.BUSQUEDA_LETRAS]: ActivityScreen1,
  [ACTIVITY_TYPES.ASOCIACION_FOTOS]: ActivityScreen2,
  [ACTIVITY_TYPES.MATEMATICAS]: ActivityScreen3,
  [ACTIVITY_TYPES.DIFERENCIAS]: ActivityScreen4,
  [ACTIVITY_TYPES.FORMAR_REFRANES]: ActivityScreen5,
  [ACTIVITY_TYPES.CLASIFICACION_PALABRAS]: ActivityScreen6,
  [ACTIVITY_TYPES.MEMORIA_OBJETOS]: ActivityScreen7,
  [ACTIVITY_TYPES.LECTURA_PREGUNTAS]: ActivityScreen8,
  [ACTIVITY_TYPES.CUMPLIR_INSTRUCCIONES]: ActivityScreen9,
  [ACTIVITY_TYPES.IDENTIFICAR_OBJETOS]: ActivityScreen10,
  // ...otros tipos
};

const ActivityPlay = () => {
  const { activityId, treatmentId } = useParams(); // Extrae ambos parámetros
  const { data: activity, isLoading, error } = useGetActivityByIdQuery(activityId);
  const [ActivityComponent, setActivityComponent] = useState(null);

  useEffect(() => {
    console.log('treatmentId:', treatmentId);
    console.log('activityId:', activityId);

    if (activity) {
      console.log('Actividad obtenida en ActivityPlay:', activity);
      
      const { type, difficultyLevel } = activity;

      // Validar que el nivel es válido
      if (!ACTIVITY_LEVELS.includes(difficultyLevel)) {
        setActivityComponent(<Message variant="danger">Nivel de actividad inválido.</Message>);
        return;
      }

      const Component = activityComponents[type];
      
      if (Component) {
        setActivityComponent(<Component activity={activity} treatmentId={treatmentId} level={difficultyLevel} />);
      } else {
        setActivityComponent(<Message variant="danger">Tipo de actividad desconocido.</Message>);
      }
    }
  }, [activity, treatmentId]);

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">Error al cargar la actividad: {error?.data?.message || error.message}</Message>;

  return (
    <div>
      {ActivityComponent}
    </div>
  );
};

export default ActivityPlay;
