import { apiSlice } from './apiSlice';

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
      query: () => '/api/treatments/myactivities',
      providesTags: ['AssignedActivities'],
    }),
    createTreatment: builder.mutation({
      query: (treatmentData) => ({
        url: '/api/assignments/create', // Asegúrate de que la URL coincide con la ruta en el backend
        method: 'POST',
        body: treatmentData,
      }),
    }),    
  }),
});

export const {
  useGetActivitiesQuery,
  useAssignActivityToPatientMutation,
  useGetAssignedActivitiesQuery,
  useDeleteAssignedActivityMutation,
  useGetMyAssignedActivitiesQuery,
  useCreateTreatmentMutation
} = treatmentApiSlice;
