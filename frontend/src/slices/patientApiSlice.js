// frontend/src/slices/patientApiSlice.js

import { apiSlice } from './apiSlice';

// Asegúrate de que la ruta "/api/patients" sea accesible a todos los usuarios autenticados
export const patientApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query({
      query: () => '/api/patients',
      providesTags: ['Patient'],
    }),
    getPatientById: builder.query({
      query: (id) => `/api/patients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),
    getMyPatient: builder.query({
      query: () => '/api/patients/me',
      providesTags: ['Patient'],
    }),
    updatePatient: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/patients/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Patient', id }],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useGetMyPatientQuery,
  useUpdatePatientMutation,
} = patientApiSlice;
