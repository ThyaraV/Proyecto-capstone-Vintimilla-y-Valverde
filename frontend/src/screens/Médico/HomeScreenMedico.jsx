import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetDoctorWithPatientsQuery } from '../../slices/doctorApiSlice';
import { Link } from 'react-router-dom';
import '../../assets/styles/HomeMedicoScreen.css';

const HomeScreenMedico = () => {
  const [localPatients, setLocalPatients] = useState([]); // Estado local para manejar los pacientes
  const [isFetching, setIsFetching] = useState(true); // Controla si estamos esperando datos nuevos
  const { data: patients, isLoading, error, refetch } = useGetDoctorWithPatientsQuery();
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Limpiar el estado local cuando el usuario cambia o el componente se monta
  useEffect(() => {
    setLocalPatients([]); // Limpiar los pacientes inmediatamente
    setIsFetching(true);  // Activar el estado de carga manualmente
    if (userInfo) {
      refetch(); // Volver a obtener los datos cuando haya un cambio en el usuario
    }
  }, [userInfo, refetch]);

  // Actualizar el estado local una vez que los nuevos datos están disponibles y cargados
  useEffect(() => {
    if (!isLoading && patients) {
      setLocalPatients(patients); // Actualizar el estado local con los datos nuevos
      setIsFetching(false); // Desactivar el estado de carga cuando los datos están listos
    }
  }, [isLoading, patients]);

  return (
    <div className="table-container">
      <h2>Pacientes Asignados</h2>
      {isLoading || isFetching ? (
        <p>Cargando pacientes...</p> // Mostrar mensaje de carga hasta que se obtengan los datos correctos
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
