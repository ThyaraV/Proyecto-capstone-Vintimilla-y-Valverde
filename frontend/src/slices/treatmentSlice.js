import { apiSlice } from './apiSlice';

export const activityApiSlice = apiSlice.injectEndpoints({
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
    }),
    getAssignedActivities: builder.query({
      query: (patientId) => `/api/assignments/${patientId}/activities`,
    }),
    deleteAssignedActivity: builder.mutation({
      query: (assignmentId) => ({
        url: `/api/assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AssignedActivities'], // Invalida la cache para que los datos se actualicen
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useAssignActivityToPatientMutation,
  useGetAssignedActivitiesQuery,
  useDeleteAssignedActivityMutation,
} = activityApiSlice;
