// frontend/src/components/MedicalHistory.jsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPatientByIdQuery, useUpdatePatientMutation } from '../../slices/patientApiSlice';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack'; // Importar useSnackbar

const genderOptions = [
  { value: 'Male', label: 'Masculino' },
  { value: 'Female', label: 'Femenino' },
  { value: 'Other', label: 'Otro' },
];

const maritalStatusOptions = [
  { value: 'Single', label: 'Soltero' },
  { value: 'Married', label: 'Casado' },
  { value: 'Divorced', label: 'Divorciado' },
  { value: 'Widowed', label: 'Viudo' },
];

const MedicalHistory = () => {
  const { id } = useParams(); // ID del paciente
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Usar notistack

  // **1. Llamar a los Hooks de Forma Incondicional**
  const { data: patient, isLoading, isError, error } = useGetPatientByIdQuery(id);
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();

  // **2. Definir el Esquema de Validación con Yup**
  const schema = yup.object().shape({
    school: yup.string().required('La escuela es requerida'),
    birthdate: yup
      .date()
      .required('La fecha de nacimiento es requerida')
      .max(new Date(), 'La fecha de nacimiento no puede ser futura'),
    gender: yup.string().required('El género es requerido'),
    educationalLevel: yup.string().required('El nivel educativo es requerido'),
    familyRepresentative: yup.string().required('El representante familiar es requerido'),
    address: yup.string().required('La dirección es requerida'),
    maritalStatus: yup.string().required('El estado civil es requerido'),
    profession: yup.string().required('La profesión es requerida'),
    cognitiveStage: yup.string().required('La etapa cognitiva es requerida'),
    referredTo: yup.string().required('Referencia es requerida'),
    doctor: yup.string().required('El doctor es requerido'),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      school: '',
      birthdate: '',
      gender: '',
      educationalLevel: '',
      familyRepresentative: '',
      address: '',
      maritalStatus: '',
      profession: '',
      cognitiveStage: '',
      referredTo: '',
      doctor: '',
    },
  });

  // **3. Actualizar el Formulario Cuando los Datos del Paciente Cargan**
  useEffect(() => {
    if (patient) {
      console.log("Datos del paciente:", patient); // Verificar en la consola
      reset({
        school: patient.school || '',
        birthdate: patient.birthdate ? patient.birthdate.split('T')[0] : '',
        gender: patient.gender || '',
        educationalLevel: patient.educationalLevel || '',
        familyRepresentative: patient.familyRepresentative || '',
        address: patient.address || '',
        maritalStatus: patient.maritalStatus || '',
        profession: patient.profession || '',
        cognitiveStage: patient.cognitiveStage || '',
        referredTo: patient.referredTo || '',
        doctor: patient.doctor || '',
      });
    }
  }, [patient, reset]);

  // **4. Manejar la Envío del Formulario**
  const onSubmit = async (data) => {
    try {
      await updatePatient({ id, ...data }).unwrap();
      enqueueSnackbar('Historial médico actualizado exitosamente', { variant: 'success' });
      navigate(`/patients/${id}`, { replace: true });
    } catch (err) {
      console.error('Failed to update patient:', err);
      enqueueSnackbar('Error al actualizar el historial médico', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom mt={4}>
        {patient?.user?.name} {patient?.user?.lastName} - Historial Médico
      </Typography>

      {/* **5. Manejar Estados de Carga y Errores Dentro del JSX** */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="error" variant="h6" align="center" mt={5}>
          {error?.data?.message || 'Error al cargar los datos del paciente.'}
        </Typography>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            {/* Campos de Usuario - Solo Lectura */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                value={patient?.user?.name || ''}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellido"
                value={patient?.user?.lastName || ''}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cédula"
                value={patient?.user?.cardId || ''}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                value={patient?.user?.email || ''}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Número de Teléfono"
                value={patient?.user?.phoneNumber || ''}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
              />
            </Grid>

            {/* Campos Editables del Historial Médico */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="school"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Escuela"
                    fullWidth
                    variant="outlined"
                    error={!!errors.school}
                    helperText={errors.school?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="birthdate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Fecha de Nacimiento"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={!!errors.birthdate}
                    helperText={errors.birthdate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Género"
                    fullWidth
                    variant="outlined"
                    error={!!errors.gender}
                    helperText={errors.gender?.message}
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="educationalLevel"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nivel Educativo"
                    fullWidth
                    variant="outlined"
                    error={!!errors.educationalLevel}
                    helperText={errors.educationalLevel?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="familyRepresentative"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Representante Familiar"
                    fullWidth
                    variant="outlined"
                    error={!!errors.familyRepresentative}
                    helperText={errors.familyRepresentative?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Dirección"
                    fullWidth
                    variant="outlined"
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Estado Civil"
                    fullWidth
                    variant="outlined"
                    error={!!errors.maritalStatus}
                    helperText={errors.maritalStatus?.message}
                  >
                    {maritalStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="profession"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Profesión"
                    fullWidth
                    variant="outlined"
                    error={!!errors.profession}
                    helperText={errors.profession?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cognitiveStage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Etapa Cognitiva"
                    fullWidth
                    variant="outlined"
                    error={!!errors.cognitiveStage}
                    helperText={errors.cognitiveStage?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="referredTo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Referencia a"
                    fullWidth
                    variant="outlined"
                    error={!!errors.referredTo}
                    helperText={errors.referredTo?.message}
                  />
                )}
              />
            </Grid>

            {/* Botones */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isUpdating}
                startIcon={isUpdating && <CircularProgress size={20} />}
              >
                {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </Container>
  );
};

export default MedicalHistory;
