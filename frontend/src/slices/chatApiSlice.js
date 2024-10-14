import { apiSlice } from "./apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query({
      query: () => "/api/chats",
      providesTags: ["Chat"],
    }),
    sendMessage: builder.mutation({
      query: ({ chatId, content }) => ({
        url: `/api/chats/${chatId}/send`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const { useGetChatsQuery, useSendMessageMutation } = chatApiSlice;
