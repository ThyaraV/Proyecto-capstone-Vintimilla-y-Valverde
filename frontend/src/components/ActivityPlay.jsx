// src/screens/ActivityPlay.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetActivityByIdQuery } from '../slices/activitiesSlice.js'; // Asumiendo que tienes un slice para actividades
import ActivityScreen1 from '../screens/ActivityScreen1';
import ActivityScreen2 from '../screens/ActivityScreen2';
import ActivityScreen3 from '../screens/ActivityScreen3';
// ... importa otros componentes de actividad según sea necesario
import Loader from '../components/Loader';
import Message from '../components/Message';

const ActivityPlay = () => {
  const { activityId, treatmentId } = useParams(); // Extrae ambos parámetros
  const { data: activity, isLoading, error } = useGetActivityByIdQuery(activityId);
  const [ActivityComponent, setActivityComponent] = useState(null);

  useEffect(() => {
    console.log('treatmentId:', treatmentId);
    console.log('activityId:', activityId);

    if (activity) {
      console.log('Actividad obtenida en ActivityPlay:', activity);
      
      switch (activity.type) {
        case 'busqueda_letras':
          setActivityComponent(<ActivityScreen1 activity={activity} treatmentId={treatmentId} />);
          break;
        case 'asociacion_fotos':
          setActivityComponent(<ActivityScreen2 activity={activity} treatmentId={treatmentId} />);
          break;
        case 'suma_resta':
          setActivityComponent(<ActivityScreen3 activity={activity} treatmentId={treatmentId} />);
          break;
        // ... añade más casos según tus tipos de actividad
        default:
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



