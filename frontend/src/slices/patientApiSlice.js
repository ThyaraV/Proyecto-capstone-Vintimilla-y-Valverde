// frontend/src/slices/patientApiSlice.js

import { apiSlice } from "./apiSlice";

export const patientApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query({
      query: () => "/api/patients",
      providesTags: ["Patient"],
    }),
    getPatientById: builder.query({
      query: (id) => `/api/patients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),
    updatePatient: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/patients/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Patient', id }],
    }),
  }),
});

export const { useGetPatientsQuery, useGetPatientByIdQuery, useUpdatePatientMutation } = patientApiSlice;
