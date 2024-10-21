import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import {Provider} from 'react-redux';
import PrivateRoute from './components/PrivateRoutes.jsx';
import store from './store.js';
import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import HomeScreenPaciente from './screens/HomeScreenPaciente';
import Login from './screens/Login';
import RegisterScreen from './screens/RegisterScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import HomeScreenMedico from './screens/Médico/HomeScreenMedico.jsx';
import UserListScreen from './screens/Médico/UserListScreen.jsx';
import UserEditScreen from './screens/Médico/UserEditScreen.jsx';
import ActivitiesListScreen from './screens/Médico/ActivitiesListScreen.jsx';
import ActivityEditScreen from './screens/Médico/ActivityEditScreen.jsx';
import ActivitiesScreen from './screens/ActivitiesScreen.jsx';
import ActivityScreen1 from './screens/ActivityScreen1.jsx';
import ActivityScreen2 from './screens/ActivityScreen2.jsx';
import ActivityScreen3 from './screens/ActivityScreen3.jsx';
import ActivityScreen4 from './screens/ActivityScreen4.jsx';
import ActivityScreen5 from './screens/ActivityScreen5.jsx';
import ActivityScreen6 from './screens/ActivityScreen6.jsx';
import ActivityScreen7 from './screens/ActivityScreen7.jsx';
import ActivityScreen8 from './screens/ActivityScreen8.jsx';
import ActivityScreen9 from './screens/ActivityScreen9.jsx';
import ActivityScreen10 from './screens/ActivityScreen10.jsx';
import ActivitiesL2Screen from './screens/ActivitiesL2Screen.jsx';
import ActivitiesL3Screen from './screens/ActivitiesL3Screen.jsx';
import Activity1L2Screen from './screens/Activity1L2Screen.jsx';
import Activity1L3Screen from './screens/Activity1L3Screen.jsx';




const router=createBrowserRouter(
  createRoutesFromElements(
  <Route path="/" element={<App/>}>
    <Route index={true} path="/" element={<HomeScreenPaciente/>}/>
    <Route path="/login" element={<Login/>}></Route>
    <Route path="/register" element={<RegisterScreen/>}></Route>
  
    <Route path='' element={<PrivateRoute/>}>
      <Route path="/profile" element={<ProfileScreen/>}></Route>
      <Route path="/activities" element={<ActivitiesScreen/>}></Route>
      <Route path="/activity/1" element={<ActivityScreen1/>}></Route>
      <Route path="/activity/2" element={<ActivityScreen2/>}></Route>
      <Route path="/activity/3" element={<ActivityScreen3/>}></Route>
      <Route path="/activity/4" element={<ActivityScreen4/>}></Route>
      <Route path="/activity/5" element={<ActivityScreen5/>}></Route>
      <Route path="/activity/6" element={<ActivityScreen6/>}></Route>
      <Route path="/activity/7" element={<ActivityScreen7/>}></Route>
      <Route path="/activity/8" element={<ActivityScreen8/>}></Route>
      <Route path="/activity/9" element={<ActivityScreen9/>}></Route>
      <Route path="/activity/10" element={<ActivityScreen10/>}></Route>
      <Route path="/activitiesL2" element={<ActivitiesL2Screen/>}></Route>
      <Route path="/activity/level2/1" element={<Activity1L2Screen/>}></Route>
      <Route path="/activitiesL3" element={<ActivitiesL3Screen/>}></Route>
      <Route path="/activity/level3/1" element={<Activity1L3Screen/>}></Route>


    </Route>

    <Route path='' element={<AdminRoute/>}>
      <Route path="/admin/userlist" element={<UserListScreen/>}></Route>
      <Route path="/admin/user/:id/edit" element={<UserEditScreen/>}></Route>
      <Route path="/admin/activities" element={<ActivitiesListScreen/>}></Route>
      <Route path="/admin/activities/:id/edit" element={<ActivityEditScreen/>}></Route>


    </Route>
  </Route>
  
  )
)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
