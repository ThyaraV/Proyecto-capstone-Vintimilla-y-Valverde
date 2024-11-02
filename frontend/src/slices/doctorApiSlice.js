// frontend/src/slices/doctorApiSlice.js

import { apiSlice } from "./apiSlice";

export const doctorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query({
      query: () => "/api/doctors",
      providesTags: ["Doctor"],
    }),
    getDoctorWithPatients: builder.query({
      query: () => "/api/doctors/withPatients",
      providesTags: ["Doctor"],
    }),
    addPatientToDoctor: builder.mutation({
      query: ({ doctorId, patientId }) => ({
        url: `/api/doctors/${doctorId}/addPatient`,
        method: "POST",
        body: { patientId },
      }),
      invalidatesTags: ["Doctor"],
    }),
  }),
});

export const { useGetDoctorsQuery, useAddPatientToDoctorMutation, useGetDoctorWithPatientsQuery } = doctorApiSlice;
