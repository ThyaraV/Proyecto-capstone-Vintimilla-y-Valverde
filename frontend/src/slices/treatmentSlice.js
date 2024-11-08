import { apiSlice } from './apiSlice';

export const treatmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query({
      query: () => '/api/activities',
    }),
    assignActivityToPatient: builder.mutation({
      query: ({ patientId, doctorId, activityId }) => ({
        url: '/api/assignments',
        method: 'POST',
        body: { patientId, doctorId, activityId },
      }),
      invalidatesTags: ['AssignedActivities'],
    }),
    getAssignedActivities: builder.query({
      query: (patientId) => `/api/assignments/${patientId}/activities`,
      providesTags: ['AssignedActivities'],
    }),
    deleteAssignedActivity: builder.mutation({
      query: (assignmentId) => ({
        url: `/api/assignments/${assignmentId}`,
        method: 'PUT', // Ajustar si necesitas un método diferente
      }),
      invalidatesTags: ['AssignedActivities'],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useAssignActivityToPatientMutation,
  useGetAssignedActivitiesQuery,
  useDeleteAssignedActivityMutation,
} = treatmentApiSlice;
