import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Services from './pages/Services';
import Jobs from './pages/Jobs';
import ApplyServices from './pages/ApplyServices';
import Courses from './pages/Courses';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import About from './pages/About';
import StudentDashboard from './pages/StudentDashboard';
import AdminLogin from './pages/AdminLogin';
import RegisterAdmin from './pages/RegisterAdmin';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';


export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/services" element={<Services />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/apply-services" element={<Contact />} />
        <Route path="/study" element={<Courses />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/register" element={<RegisterAdmin />} />
       
    </Routes>
  );
}
