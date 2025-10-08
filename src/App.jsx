

// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavbarComponent from "./components/Navbar";
import InterviewBot from "./components/InterviewBot";
import Login from './pages/Login';
import Signup from './pages/Signup';
import "./css/style.css";
import { useDispatch } from "react-redux";
// import { authActionDataAction } from "./reduxServices/actions/Authaction";
// import AddProject from "./pages/project/AddProject";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';





function App() {
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   if (localStorage.getItem("workload-token") !== undefined) {
      
  //     dispatch(authActionDataAction.userDetailsHandler());
  //   }
  // })


  return (
    <>
    <Router>
      <div>
      <ToastContainer position="top-right" autoClose={3000} />
        <NavbarComponent />
        <Routes>
          <Route path="/" element={<InterviewBot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
        </>
    
  );
}

export default App;
