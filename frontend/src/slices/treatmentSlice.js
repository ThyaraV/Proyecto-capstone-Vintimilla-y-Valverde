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
      invalidatesTags: (result, error, { patientId }) => [
        { type: 'AssignedActivities', id: patientId },
      ],
    }),
    getMyAssignedActivities: builder.query({
      query: () => '/api/assignments/myactivities',
      providesTags: ['AssignedActivities'],
    }),
        
  }),
});

export const {
  useGetActivitiesQuery,
  useAssignActivityToPatientMutation,
  useGetAssignedActivitiesQuery,
  useDeleteAssignedActivityMutation,
  useGetMyAssignedActivitiesQuery
} = treatmentApiSlice;
