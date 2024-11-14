// src/slices/treatmentApiSlice.js

import { apiSlice } from './apiSlice';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const treatmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // **Asignaciones Endpoints**
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
      invalidatesTags: (result, error, { patientId }) => [
        { type: 'AssignedActivities', id: patientId },
      ],
    }),    
    getMyAssignedActivities: builder.query({
      query: () => '/api/assignments/myactivities',
      providesTags: ['AssignedActivities'],
    }),

    // **Tratamientos Endpoints**
    createTreatment: builder.mutation({
      query: (treatmentData) => ({
        url: '/api/treatments/create',
        method: 'POST',
        body: treatmentData,
      }),
      invalidatesTags: ['Treatments'],
    }),
    getMyTreatments: builder.query({
      query: () => '/api/treatments/mytreatments',
      providesTags: ['Treatments'],
    }),
    getTreatmentById: builder.query({
      query: (treatmentId) => `/api/treatments/${treatmentId}`,
      providesTags: (result, error, treatmentId) => [{ type: 'Treatment', id: treatmentId }],
    }), 
    updateTreatment: builder.mutation({
      query: ({ treatmentId, updatedData }) => ({
        url: `/api/treatments/${treatmentId}`,
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: (result, error, { treatmentId }) => [
        { type: 'Treatment', id: treatmentId },
        'Treatments',
      ],
    }),

    // **Medicamentos Endpoints**
    getMyMedications: builder.query({
      query: () => '/api/treatments/my-medications',
      providesTags: ['Medications'],
    }), 
    getDueMedications: builder.query({
      query: () => '/api/treatments/due-medications',
      providesTags: ['Medications'],
    }),      
  }),
});

export const {
  // **Asignaciones Hooks**
  useGetActivitiesQuery,
  useGetAssignedActivitiesQuery,
  useAssignActivityToPatientMutation,
  useDeleteAssignedActivityMutation,
  useGetMyAssignedActivitiesQuery,

  // **Tratamientos Hooks**
  useCreateTreatmentMutation,
  useGetMyTreatmentsQuery,
  useGetTreatmentByIdQuery,
  useUpdateTreatmentMutation,

  // **Medicamentos Hooks**
  useGetMyMedicationsQuery,
  useGetDueMedicationsQuery,
} = treatmentApiSlice;
