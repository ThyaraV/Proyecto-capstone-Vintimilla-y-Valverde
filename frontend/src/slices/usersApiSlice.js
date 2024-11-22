import { USERS_URL } from "../constants.js";
import { apiSlice } from "./apiSlice.js";

export const usersApiSlice=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        login:builder.mutation({
            query:(data)=>({
                url:`${USERS_URL}/auth`,
                method:'POST',
                body:data,
            }),
        }), 
        register:builder.mutation({
            query:(data)=>({
                url:`${USERS_URL}`,
                method:'POST',
                body:data,
            })
        }),
        logout:builder.mutation({
            query:()=>({
                url:`${USERS_URL}/logout`,
                method:'POST',
            })
        }),
        profile:builder.mutation({
            query:(data)=>({
                url:`${USERS_URL}/profile`,
                method:'PUT',
                body:data,
            })
        }),
        getUsers:builder.query({
            query:()=>({
                url: USERS_URL
            }),
            providesTags:['Users'],
            KeepUnusedDataFor:5
        }),
        deleteUser:builder.mutation({
            query:(userId)=>({
                url:`${USERS_URL}/${userId}`,
                method: 'DELETE',
            })
        }),
        getUserDetails:builder.query({
            query:(userId)=>({
                url:`${USERS_URL}/${userId}`,
            }),
            KeepUnusedDataFor:5,
        }),
        updateUser:builder.mutation({
            query:(data)=>({
                url:`${USERS_URL}/${data.userId}`,
                method: 'PUT',
                body:data,
            }),
            invalidatesTags:['Users'],
        }),
        searchUsers: builder.query({
            query: (searchTerm) => ({
                url: `${USERS_URL}/search?query=${searchTerm}`,
            }),
            providesTags: ['Users'],
        }), 
        enableUser: builder.mutation({
            query: (userId) => ({
              url: `${USERS_URL}/${userId}/enable`, // Asegúrate de que esté en la ruta correcta
              method: 'PUT',
            }),
          }),
          saveMood: builder.mutation({
            query: (mood) => ({
                url: `${USERS_URL}/mood`,
                method: 'POST',
                body: { mood },
            }),
            invalidatesTags: ['UserMood'], // Opcional: para invalidar caches si es necesario
        }),                           
    }),
});

export const {useLoginMutation,useLogoutMutation, 
useRegisterMutation,useProfileMutation,useGetUsersQuery,
useDeleteUserMutation,useGetUserDetailsQuery,
useUpdateUserMutation, useSearchUsersQuery, useEnableUserMutation,useSaveMoodMutation}=usersApiSlice;