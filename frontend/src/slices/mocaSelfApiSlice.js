import { apiSlice } from "./apiSlice";

export const mocaSelfApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Crear un registro MocaSelf
    createMocaSelf: builder.mutation({
      query: (mocaData) => ({
        url: "/api/mocaSelf",
        method: "POST",
        body: mocaData,
      }),
      invalidatesTags: ["MocaSelf"],
    }),

    // Obtener todos los MocaSelf (opcional: filtrar por patientId)
    getAllMocaSelfs: builder.query({
      query: (patientId) => {
        let url = "/api/mocaSelf";
        if (patientId) {
          url += `?patientId=${patientId}`;
        }
        return url;
      },
      providesTags: ["MocaSelf"],
    }),

    // Obtener un MocaSelf por ID
    getMocaSelfById: builder.query({
      query: (id) => `/api/mocaSelf/${id}`,
      providesTags: ["MocaSelf"],
    }),

    // Actualizar un registro MocaSelf
    updateMocaSelf: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/mocaSelf/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["MocaSelf"],
    }),

    // Eliminar un registro MocaSelf
    deleteMocaSelf: builder.mutation({
      query: (id) => ({
        url: `/api/mocaSelf/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MocaSelf"],
    }),
  }),
});

export const {
  useCreateMocaSelfMutation,
  useGetAllMocaSelfsQuery,
  useGetMocaSelfByIdQuery,
  useUpdateMocaSelfMutation,
  useDeleteMocaSelfMutation,
} = mocaSelfApiSlice;
