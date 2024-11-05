import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import PrivateRoute from "./components/PrivateRoutes.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import store from "./store.js";
import "./assets/styles/bootstrap.custom.css";
import "./assets/styles/index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import HomeScreenPaciente from "./screens/HomeScreenPaciente";
import HomeScreenMedico from "./screens/Médico/HomeScreenMedico.jsx";
import Login from "./screens/Login";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import ChatScreen from "./screens/ChatScreen.jsx";
import UserListScreen from "./screens/Médico/UserListScreen.jsx";
import UserEditScreen from "./screens/Médico/UserEditScreen.jsx";
import ActivitiesListScreen from "./screens/Médico/ActivitiesListScreen.jsx";
import ActivityEditScreen from "./screens/Médico/ActivityEditScreen.jsx";
import ActivitiesScreen from "./screens/ActivitiesScreen.jsx";
import ActivityScreen1 from "./screens/ActivityScreen1.jsx";
import ActivityScreen2 from "./screens/ActivityScreen2.jsx";
import ActivityScreen3 from "./screens/ActivityScreen3.jsx";
import ActivityScreen4 from "./screens/ActivityScreen4.jsx";
import ActivityScreen5 from "./screens/ActivityScreen5.jsx";
import ActivityScreen6 from "./screens/ActivityScreen6.jsx";
import ActivityScreen7 from "./screens/ActivityScreen7.jsx";
import ActivityScreen8 from "./screens/ActivityScreen8.jsx";
import ActivityScreen9 from "./screens/ActivityScreen9.jsx";
import ActivityScreen10 from "./screens/ActivityScreen10.jsx";
import ActivitiesL2Screen from "./screens/ActivitiesL2Screen.jsx";
import ActivitiesL3Screen from "./screens/ActivitiesL3Screen.jsx";
import Activity1L2Screen from "./screens/Activity1L2Screen.jsx";
import Activity2L2Screen from "./screens/Activity2L2Screen.jsx";
import Activity3L2Screen from "./screens/Activity3L2Screen.jsx";
import Activity4L2Screen from "./screens/Activity4L2Screen.jsx";
import Activity5L2Screen from "./screens/Activity5L2Screen.jsx";
import Activity6L2Screen from "./screens/Activity6L2Screen.jsx";
import Activity7L2Screen from "./screens/Activity7L2Screen.jsx";
import Activity8L2Screen from "./screens/Activity8L2Screen.jsx";
import Activity9L2Screen from "./screens/Activity9L2Screen.jsx";
import Activity1L3Screen from "./screens/Activity1L3Screen.jsx";
import Activity2L3Screen from "./screens/Activity2L3Screen.jsx";
import Activity3L3Screen from "./screens/Activity3L3Screen.jsx";
import Activity4L3Screen from "./screens/Activity4L3Screen.jsx";
import Activity5L3Screen from "./screens/Activity5L3Screen.jsx";
import Activity6L3Screen from "./screens/Activity6L3Screen.jsx";
import Activity7L3Screen from "./screens/Activity7L3Screen.jsx";
import Activity8L3Screen from "./screens/Activity8L3Screen.jsx";
import Activity9L3Screen from "./screens/Activity9L3Screen.jsx";

import MocaScreen from "./screens/MocaScreen";
import MocaRegisterResults from "./screens/MocaRegisterResults";
import MocaHistory from "./screens/MocaHistory";
import MocaStart from "./screens/MocaStart";

const HomeScreenSelector = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Verificamos si el usuario está autenticado y es administrador
  if (userInfo && userInfo.isAdmin) {
    return <HomeScreenMedico />;
  }

  return <HomeScreenPaciente />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* En lugar de definir HomeScreenPaciente directamente, usa HomeScreenSelector */}
      <Route index={true} path="/" element={<HomeScreenSelector />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/chat" element={<ChatScreen />} />

      <Route path="" element={<PrivateRoute />}>
        {/* Rutas privadas para los pacientes */}
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/activities" element={<ActivitiesScreen />} />
        {/* Actividades de nivel 1 */}
        <Route path="/activity/1" element={<ActivityScreen1 />} />
        <Route path="/activity/2" element={<ActivityScreen2 />} />
        <Route path="/activity/3" element={<ActivityScreen3 />} />
        <Route path="/activity/4" element={<ActivityScreen4 />} />
        <Route path="/activity/5" element={<ActivityScreen5 />} />
        <Route path="/activity/6" element={<ActivityScreen6 />} />
        <Route path="/activity/7" element={<ActivityScreen7 />} />
        <Route path="/activity/8" element={<ActivityScreen8 />} />
        <Route path="/activity/9" element={<ActivityScreen9 />} />
        <Route path="/activity/10" element={<ActivityScreen10 />} />

        {/* Actividades de nivel 2 */}
        <Route path="/activitiesL2" element={<ActivitiesL2Screen />} />
        <Route path="/activity/level2/1" element={<Activity1L2Screen />} />
        <Route path="/activity/level2/2" element={<Activity2L2Screen />} />
        <Route path="/activity/level2/3" element={<Activity3L2Screen />} />
        <Route path="/activity/level2/4" element={<Activity4L2Screen />} />
        <Route path="/activity/level2/5" element={<Activity5L2Screen />} />
        <Route path="/activity/level2/6" element={<Activity6L2Screen />} />
        <Route path="/activity/level2/7" element={<Activity7L2Screen />} />
        <Route path="/activity/level2/8" element={<Activity8L2Screen />} />
        <Route path="/activity/level2/9" element={<Activity9L2Screen />} />

        {/* Actividades de nivel 3 */}
        <Route path="/activitiesL3" element={<ActivitiesL3Screen />} />
        <Route path="/activity/level3/1" element={<Activity1L3Screen />} />
        <Route path="/activity/level3/2" element={<Activity2L3Screen />} />
        <Route path="/activity/level3/3" element={<Activity3L3Screen />} />
        <Route path="/activity/level3/4" element={<Activity4L3Screen />} />
        <Route path="/activity/level3/5" element={<Activity5L3Screen />} />
        <Route path="/activity/level3/6" element={<Activity6L3Screen />} />
        <Route path="/activity/level3/7" element={<Activity7L3Screen />} />
        <Route path="/activity/level3/8" element={<Activity8L3Screen />} />
        <Route path="/activity/level3/9" element={<Activity9L3Screen />} />
      </Route>

      <Route path="" element={<AdminRoute />}>
        {/* Ruta de MoCA para el médico/admin */}
        <Route path="/moca" element={<MocaScreen />} />
        <Route path="/moca/register/:id" element={<MocaRegisterResults />} />
        <Route path="/moca/history/:id" element={<MocaHistory />} />
        <Route path="/moca/start/:id" element={<MocaStart />} />
        
        <Route
          index={true}
          path="/admin/withPatients"
          element={<HomeScreenMedico />}
        />
        <Route path="/admin/userlist" element={<UserListScreen />} />
        <Route path="/admin/user/:id/edit" element={<UserEditScreen />} />
        <Route path="/admin/activities" element={<ActivitiesListScreen />} />
        <Route
          path="/admin/activities/:id/edit"
          element={<ActivityEditScreen />}
        />
      </Route>
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
