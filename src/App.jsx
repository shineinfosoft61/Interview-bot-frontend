

// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import NavbarComponent from "./components/Navbar";
import InterviewBot from "./components/InterviewBot";
import HRControl from "./components/HRControl";
import SheduleList from "./components/SheduleList";
import Requirements from "./components/Requirements";
import JobDescriptions from "./pages/JobDescriptions";
import CandidateList from "./pages/CandidateList";
import Login from './pages/Login';
import Signup from './pages/Signup';
import "./css/style.css";
import Resume from './components/Resume';
import Users from './pages/Users';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector,useDispatch } from 'react-redux';
import { getCandidateAccess } from './reduxServices/actions/InterviewAction';
import { useParams } from 'react-router-dom';



const InterviewBotWrapper = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const candidateAccess = useSelector((state) => state.InterviewReducer.candidateAccess);

  useEffect(() => {
    if (id) {
      dispatch(getCandidateAccess(id)); // send UUID to your action
    }
  }, [dispatch, id]);

  if (!candidateAccess) return <div>Loading...</div>;

  return candidateAccess.interview_closed === false ? (
    <InterviewBot />
  ) : (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-2xl font-semibold text-red-600">⚠️ This interview link is no longer accessible.</div>
      </div>
    </div>
  );
};

// Inner content that can use hooks like useLocation (inside Router)
function AppContent() {
  const [isOpen, setIsOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, [location]);

  // If authenticated and still on /login, push to a default app page
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/hr-control', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <>
      {isAuthenticated && <NavbarComponent isOpen={isOpen} setIsOpen={setIsOpen}/>} 
      <Routes>
        {isAuthenticated ? (
          <>
            {/* Dynamic route for UUID */}
            <Route path="/:id" element={<InterviewBotWrapper />} />
            <Route path="/hr-control" element={<HRControl />} />
            <Route path="/scheduled-interviews" element={<SheduleList />} />
            <Route path="/job-descriptions" element={<JobDescriptions />} />
            <Route path="/candidates" element={<CandidateList />} />
            <Route path="/requirements" element={<Requirements />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/users" element={<Users />} />
            <Route path="/signup" element={<Signup />} />
            {/* Default redirect when authenticated */}
            <Route path="*" element={<Navigate to="/hr-control" replace />} />
          </>
        ) : (
          <>
            {/* Unauthenticated users see only Login */}
            <Route path="/login" element={<Login />} />
            {/* Redirect everything else to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <AppContent />
    </Router>
  );
}

export default App;
