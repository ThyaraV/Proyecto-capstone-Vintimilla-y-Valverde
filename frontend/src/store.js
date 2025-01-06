import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice.js";
import authSliceReducer from "./slices/authSlice.js";
//import treatmentSlice from './slices/treatmentSlice.js';
import { mocaSelfApiSlice } from "./slices/mocaSelfApiSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSliceReducer,
    [mocaSelfApiSlice.reducerPath]: mocaSelfApiSlice.reducer,
    //[treatmentSlice.reducerPath]: treatmentSlice.reducer, // Agregado
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(mocaSelfApiSlice.middleware), // Agregado
     // .concat(treatmentSlice.middleware), // Agregado
  devTools: true, // Habilitar DevTools
});

export default store;
