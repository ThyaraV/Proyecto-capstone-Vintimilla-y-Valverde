// frontend/src/slices/doctorApiSlice.js

import { apiSlice } from "./apiSlice";

export const doctorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query({
      query: () => "/api/doctors",
      providesTags: ["Doctor"],
    }),
  }),
});

export const { useGetDoctorsQuery } = doctorApiSlice;
