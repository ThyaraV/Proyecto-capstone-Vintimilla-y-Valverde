import React from 'react';
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
