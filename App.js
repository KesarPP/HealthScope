// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/Homepage';
import CompareReports from './components/CompareReports';
import DietRecommendation from './components/DietRecommendation';
import AppointmentsPage from './components/AppointmentsPage';
import ChatbotPrompt from './components/ChatbotPrompt';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes without Navbar */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Routes with Navbar */}
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/compare" element={<CompareReports />} />
          <Route path="/diet" element={<DietRecommendation />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/prompt" element={<ChatbotPrompt />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
