import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SiteLayout() {
  return (
    <>
      {/* Internal CSS */}
      <style>
        {`
          .site-layout {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background-color: #f5f5f5; /* pale gray */
            color: #003366; /* rich blue text */
          }

          .site-main {
            flex: 1;
          }
        `}
      </style>

      {/* Layout JSX */}
      <div className="site-layout">
        <Header />
        <main className="site-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
