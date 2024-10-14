// frontend/src/slices/patientApiSlice.js
import { apiSlice } from "./apiSlice";

export const patientApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query({
      query: () => "/api/patients",
      providesTags: ["Patient"],
    }),
  }),
});

export const { useGetPatientsQuery } = patientApiSlice;
