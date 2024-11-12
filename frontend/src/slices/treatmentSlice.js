import { apiSlice } from './apiSlice';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const treatmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssignedActivities: builder.query({
      query: (patientId) => `/api/assignments/${patientId}/activities`,
      providesTags: (result, error, patientId) => [
        { type: 'AssignedActivities', id: patientId },
      ],
    }),
    assignActivityToPatient: builder.mutation({
      query: ({ patientId, doctorId, activityId }) => ({
        url: '/api/assignments',
        method: 'POST',
        body: { patientId, doctorId, activityId },
      }),
      invalidatesTags: (result, error, { patientId }) => [
        { type: 'AssignedActivities', id: patientId },
      ],
    }),
    deleteAssignedActivity: builder.mutation({
      query: ({ assignmentId }) => ({
        url: `/api/assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { assignmentId, patientId }) => [
        { type: 'AssignedActivities', id: patientId },
      ],
    }),    
    getMyAssignedActivities: builder.query({
      query: () => '/api/assignments/myactivities',
      providesTags: ['AssignedActivities'],
    }),
    createTreatment: builder.mutation({
      query: (treatmentData) => ({
        url: '/api/assignments/create', // Asegúrate de que la URL coincide con la ruta en el backend
        method: 'POST',
        body: treatmentData,
      }),
    }),
    getMyTreatments: builder.query({
      query: () => '/api/assignments/mytreatments',
      providesTags: ['Treatments'],
    }),

    getTreatmentById: builder.query({
      query: (treatmentId) => `/api/assignments/${treatmentId}`,
      providesTags: (result, error, treatmentId) => [{ type: 'Treatment', id: treatmentId }],
    }), 
    updateTreatment: builder.mutation({
      query: ({ treatmentId, updatedData }) => ({
        url: `/api/assignments/${treatmentId}`,
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: (result, error, { treatmentId }) => [
        { type: 'Treatment', id: treatmentId },
        'Treatments',
      ],
    }),
    getMyMedications: builder.query({
      query: () => '/treatments/my-medications',
    }),       
  }),
});

export const {
  useGetActivitiesQuery,
  useAssignActivityToPatientMutation,
  useGetAssignedActivitiesQuery,
  useDeleteAssignedActivityMutation,
  useGetMyAssignedActivitiesQuery,
  useCreateTreatmentMutation,
  useGetMyTreatmentsQuery,
  useGetTreatmentByIdQuery,
  useUpdateTreatmentMutation,
  useGetMyMedicationsQuery
} = treatmentApiSlice;
