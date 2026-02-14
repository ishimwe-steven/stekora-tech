import React from 'react';

export default function Services() {
  return (
    <>
      {/* Internal CSS */}
      <style>
        {`
          :root {
            --bg-gray: #f5f5f5;
            --yellow: #facc15;
            --blue: #3b82f6;
            --text-dark: #0f172a;
            --text-muted: #64748b;
          }

          .services-section {
            background-color: var(--bg-gray);
            padding: 3.5rem 1rem;
          }

          .services-container {
            max-width: 72rem;
            margin: 0 auto;
          }

          .services-title {
            font-size: 1.875rem;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
          }

          .services-subtitle {
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-bottom: 2.5rem;
            max-width: 40rem;
          }

          .services-grid {
            display: grid;
            gap: 1.5rem;
          }

          @media (min-width: 768px) {
            .services-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          .service-card {
            background: #ffffff;
            border-radius: 1.25rem;
            padding: 2rem;
            text-align: center;
            border-top: 4px solid var(--blue);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .service-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 18px 35px rgba(0, 0, 0, 0.12);
          }

          .service-icon {
            font-size: 2rem;
            color: var(--blue);
            margin-bottom: 1rem;
          }

          .service-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 0.75rem;
          }

          .service-desc {
            font-size: 0.875rem;
            color: var(--text-muted);
            line-height: 1.6;
          }
        `}
      </style>

      {/* JSX */}
      <section className="services-section">
        <div className="services-container">
          <h1 className="services-title">IT Services</h1>
          <p className="services-subtitle">
            Stekora Tech delivers end-to-end IT solutions tailored to your projects.
          </p>

          <div className="services-grid">
            <div className="service-card">
              <i className="fa-solid fa-cloud service-icon"></i>
              <h2 className="service-title">Web & Cloud Development</h2>
              <p className="service-desc">
                Modern web apps, dashboards and APIs with secure admin panels and
                scalable infrastructure.
              </p>
            </div>

            <div className="service-card">
              <i className="fa-solid fa-microchip service-icon"></i>
              <h2 className="service-title">Embedded & IoT Prototyping</h2>
              <p className="service-desc">
                From Arduino and microcontrollers to production-ready hardware
                integrations.
              </p>
            </div>

            <div className="service-card">
              <i className="fa-solid fa-gears service-icon"></i>
              <h2 className="service-title">Automation & Integration</h2>
              <p className="service-desc">
                Connect systems, automate workflows, and build custom internal tools
                for your team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
