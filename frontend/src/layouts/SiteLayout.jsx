import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Font Awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faBook } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function SiteLayout() {
  const navigate = useNavigate();

  return (
    <>
      {/* Internal CSS */}
      <style>
        {`
          .site-layout {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background-color: #f5f5f5;
            color: #003366;
          }

          .site-main {
            flex: 1;
          }

          .floating-actions {
            position: fixed;
            right: 1.25rem;
            bottom: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.75rem;
            z-index: 60;
          }

          .fab-button {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.6rem 1.1rem;
            border-radius: 999px;
            border: none;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 600;
            color: #fff;
            background: linear-gradient(135deg, #facc15, rgb(143, 116, 10));
            box-shadow: 0 8px 18px rgba(0,0,0,0.16);
            white-space: nowrap;
          }

          .fab-button span.icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: rgba(255,255,255,0.16);
            font-size: 0.9rem;
          }

          .fab-button.secondary {
            background: linear-gradient(135deg, #facc15, rgb(143, 116, 10));
          }

          .fab-button.whatsapp {
            width: 48px;
            height: 48px;
            padding: 0;
            border-radius: 50%;
            justify-content: center;
            background: #25d366;
          }

          .fab-button.whatsapp span.icon {
            width: auto;
            height: auto;
            background: none;
            font-size: 1.2rem;
          }

          @media (max-width: 480px) {
            .floating-actions {
              right: 0.75rem;
              bottom: 0.9rem;
              gap: 0.55rem;
            }

            .fab-button {
              padding: 0.5rem 0.9rem;
              font-size: 0.75rem;
            }
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

        {/* Floating buttons */}
        <div className="floating-actions">
          <button
            className="fab-button"
            onClick={() => navigate('/apply-services')}
          >
            <span className="icon">
              <FontAwesomeIcon icon={faFileInvoice} />
            </span>
            <span>Apply for Services</span>
          </button>

          <button
            className="fab-button secondary"
            onClick={() => navigate('/study')}
          >
            <span className="icon">
              <FontAwesomeIcon icon={faBook} />
            </span>
            <span>Apply for Study</span>
          </button>

          <button
            className="fab-button whatsapp"
            onClick={() =>
              window.open(
                'https://wa.me/250788000000?text=Hello%20Stekora%20Tech',
                '_blank'
              )
            }
          >
            <span className="icon">
              <FontAwesomeIcon icon={faWhatsapp} />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
