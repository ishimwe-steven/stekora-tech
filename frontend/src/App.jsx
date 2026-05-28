import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import Home from './pages/Home';

const Shop = lazy(() => import('./pages/Shop'));
const Services = lazy(() => import('./pages/Services'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Courses = lazy(() => import('./pages/Courses'));
const UserLogin = lazy(() => import('./pages/UserLogin'));
const UserRegister = lazy(() => import('./pages/UserRegister'));
const About = lazy(() => import('./pages/About'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentModuleView = lazy(() => import('./pages/StudentModuleView'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const RegisterAdmin = lazy(() => import('./pages/RegisterAdmin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Contact = lazy(() => import('./pages/Contact'));


/* NEW */
const FinalExamPage = lazy(() => import('./pages/FinalExamPage'));
const StudentCertificates = lazy(() => import('./pages/StudentCertificates'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));


export default function App() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '2rem', color: '#003366' }}>
          Loading...
        </div>
      }
    >
      <Routes>

        {/* WEBSITE */}
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

        {/* STUDENT */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />

        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/course/:courseId/module/:moduleId"
          element={<StudentModuleView />}
        />

        {/* NEW FINAL EXAM */}
        <Route
          path="/student/course/:courseId/final-exam"
          element={<FinalExamPage />}
        />
        

        {/* CERTIFICATES */}
        <Route
          path="/student/certificates"
          element={<StudentCertificates />}
        />

        {/* PUBLIC CERTIFICATE VERIFY */}
        <Route
          path="/certificate/:certificateCode"
          element={<VerifyCertificate />}
        />
        

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/register" element={<RegisterAdmin />} />

      </Routes>
    </Suspense>
  );
}