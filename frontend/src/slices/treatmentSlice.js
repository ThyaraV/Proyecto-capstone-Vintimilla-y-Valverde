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
  }),
});

export const { useGetActivitiesQuery, useAssignActivityToPatientMutation, useGetAssignedActivitiesQuery} = activityApiSlice;
