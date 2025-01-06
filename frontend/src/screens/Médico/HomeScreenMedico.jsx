import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetDoctorWithPatientsQuery } from '../../slices/doctorApiSlice';
import { Link } from 'react-router-dom';
import '../../assets/styles/HomeMedicoScreen.css';
import Loader from '../../components/Loader.jsx';

const HomeScreenMedico = () => {
  const [localPatients, setLocalPatients] = useState([]); // Estado local para manejar los pacientes
  const [isFetchingData, setIsFetchingData] = useState(true); // Controla el estado de carga de los datos
  const { data: patients, isLoading, error, refetch } = useGetDoctorWithPatientsQuery();
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Efecto para limpiar el estado y activar la carga cuando el usuario cambia
  useEffect(() => {
    setLocalPatients([]); // Limpiar los datos actuales
    setIsFetchingData(true); // Mostrar el Loader mientras se obtienen nuevos datos
    if (userInfo) {
      refetch(); // Refetch para obtener los datos del nuevo usuario
    }
  }, [userInfo, refetch]);

  // Actualizar el estado local y desactivar el Loader solo cuando los nuevos datos están listos
  useEffect(() => {
    if (!isLoading && patients) {
      setLocalPatients(patients); // Actualizar con los datos correctos
      console.log(patients);
      setIsFetchingData(false); // Ocultar el Loader una vez los datos estén listos
    }
  }, [isLoading, patients]);

  return (
    <div className="table-container">
      <h2>Pacientes Asignados</h2>
      {isFetchingData ? (
        <Loader /> // Mostrar Loader hasta que los datos correctos estén listos
      ) : error ? (
        <p>Error al cargar los pacientes: {error?.data?.message || "Ocurrió un problema inesperado"}</p>
      ) : localPatients && localPatients.length > 0 ? (
        <table className="assigned-patients-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Reporte</th>
            </tr>
          </thead>
          <tbody>
            {localPatients.map((patient) => (
              <tr key={patient._id}>
                <td>{patient.user?.name || "No disponible"}</td>
                <td>{patient.user?.lastName || "No disponible"}</td>
                <td>{patient.user?.email || "No disponible"}</td>
                <td>{patient.user?.phoneNumber || "No disponible"}</td>
                <td>{patient.user?.isActive ? "Activo" : "Inactivo"}</td>
                <td>
                  <Link to={`/patient/${patient._id}/report`} className="report-link">
                    Ver reporte
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No tienes pacientes asignados.</p>
      )}
    </div>
  );
};

export default HomeScreenMedico;