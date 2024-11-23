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
import ActivityScreen4 from '../screens/ActivityScreen4.jsx';
import ActivityScreen5 from '../screens/ActivityScreen5.jsx';
import ActivityScreen6 from '../screens/ActivityScreen6.jsx';
import ActivityScreen7 from '../screens/ActivityScreen7.jsx';
import ActivityScreen8 from '../screens/ActivityScreen8.jsx';
import ActivityScreen9 from '../screens/ActivityScreen9.jsx';
import ActivityScreen10 from '../screens/ActivityScreen10.jsx';





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
        case 'matematicas':
          setActivityComponent(<ActivityScreen3 activity={activity} treatmentId={treatmentId} />);
          break;
        case 'diferencias':
          setActivityComponent(<ActivityScreen4 activity={activity} treatmentId={treatmentId} />);
          break;
        case 'formar_refranes':
          setActivityComponent(<ActivityScreen5 activity={activity} treatmentId={treatmentId} />);
          break;
        case 'clasificacion_palabras':
          setActivityComponent(<ActivityScreen6 activity={activity} treatmentId={treatmentId} />);
          break;
        case 'memoria_objetos':
          setActivityComponent(<ActivityScreen7 activity={activity} treatmentId={treatmentId} />);
          break;
        case 'lectura_preguntas':
          setActivityComponent(<ActivityScreen8 activity={activity} treatmentId={treatmentId} />);
          break;
        case 'cumplir_instrucciones':
          setActivityComponent(<ActivityScreen9 activity={activity} treatmentId={treatmentId} />);
          break;
        case 'identificar_objetos':
          setActivityComponent(<ActivityScreen10 activity={activity} treatmentId={treatmentId} />);
          break;

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



