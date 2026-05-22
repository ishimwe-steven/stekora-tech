import React, { useState } from 'react';
import fullstackImg from '../assets/image/fullstack.jpg';
import backendImg from '../assets/image/backend.png';
import iotImg from '../assets/image/iot.jpg';
import heroImg from '../assets/image/hero.jpg';
import photoshopImg from '../assets/image/photoshop.jpg';

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      icon: 'fa-cloud',
      title: 'Web & Cloud Development',
      desc: 'Modern web apps, dashboards and APIs with secure admin panels and scalable infrastructure.',
      image: fullstackImg,
      details:
        'We design and build responsive websites, business dashboards, booking systems, admin portals, APIs, and cloud-ready applications. Our work includes planning the user flow, developing the frontend and backend, connecting databases, securing accounts, and preparing the system so it can grow with your business.',
    },
    {
      icon: 'fa-microchip',
      title: 'Embedded & IoT Prototyping',
      desc: 'From Arduino and microcontrollers to production-ready hardware integrations.',
      image: iotImg,
      details:
        'We help turn hardware ideas into working prototypes using microcontrollers, sensors, displays, relays, and connected devices. This includes circuit planning, firmware programming, device testing, data collection, and connecting IoT devices to web dashboards or mobile-friendly monitoring tools.',
    },
    {
      icon: 'fa-gears',
      title: 'Automation & Integration',
      desc: 'Connect systems, automate workflows, and build custom internal tools for your team.',
      image: backendImg,
      details:
        'We automate repetitive business tasks and connect separate systems so information moves faster with fewer mistakes. This can include custom forms, reports, notifications, data sync, stock or client tracking tools, and integrations between websites, databases, spreadsheets, and third-party platforms.',
    },
    {
      icon: 'fa-video',
      title: 'CCTV Installation & Smart Surveillance',
      desc: 'Professional camera installation, monitoring setup, access control, and smart security systems for homes and businesses.',
      image: heroImg,
      details:
        'We plan and install CCTV systems for homes, shops, offices, and business sites. Our service can include camera placement, cabling, DVR/NVR setup, mobile viewing, recording configuration, access control support, troubleshooting, and guidance on keeping your surveillance system reliable.',
    },
    {
      icon: 'fa-network-wired',
      title: 'Networking, Computer Maintenance & IT Support',
      desc: 'Network setup, troubleshooting, computer repairs, software support, upgrades, and reliable ongoing technical assistance.',
      image: backendImg,
      details:
        'We set up and maintain office and home networks, troubleshoot internet and Wi-Fi issues, repair and optimize computers, install software, upgrade systems, remove common technical blockers, and provide ongoing support so your devices and team can keep working smoothly.',
    },
    {
      icon: 'fa-pen-nib',
      title: 'Graphic Design & Digital Solutions',
      desc: 'Clean brand visuals, promotional designs, digital content, websites, and business tools that help your work look professional.',
      image: photoshopImg,
      details:
        'We create clean digital designs for brands, social media, posters, flyers, business profiles, product promotions, and online campaigns. We also support digital business tools like landing pages, simple websites, forms, and branded content that helps your work look professional.',
    },
  ];

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
            border-radius: 0.5rem;
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

          .service-learn-btn {
            margin-top: 1.25rem;
            border: none;
            border-radius: 999px;
            background: #003366;
            color: #ffffff;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 700;
            padding: 0.7rem 1.15rem;
            transition: background 0.25s ease, transform 0.25s ease;
          }

          .service-learn-btn:hover {
            background: #22d3ee;
            color: #001f3f;
            transform: translateY(-1px);
          }

          .service-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 50;
            background: rgba(0, 31, 63, 0.56);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }

          .service-modal {
            width: min(620px, 100%);
            background: #ffffff;
            border-radius: 0.5rem;
            border: 1px solid rgba(34, 211, 238, 0.35);
            box-shadow: 0 24px 60px rgba(0, 31, 63, 0.28);
            overflow: hidden;
          }

          .service-modal-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            background: #003366;
            color: #ffffff;
            padding: 1.35rem 1.5rem;
          }

          .service-modal-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 800;
            line-height: 1.25;
          }

          .service-modal-close {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.35);
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            cursor: pointer;
            font-size: 1.25rem;
            line-height: 1;
            flex: 0 0 auto;
          }

          .service-modal-body {
            padding: 1.5rem;
          }

          .service-modal-image {
            width: 100%;
            aspect-ratio: 16 / 8;
            object-fit: cover;
            display: block;
            background: #e2e8f0;
          }

          .service-modal-icon {
            color: #22d3ee;
            font-size: 1.6rem;
            margin-bottom: 0.9rem;
          }

          .service-modal-text {
            margin: 0;
            color: var(--text-muted);
            font-size: 0.95rem;
            line-height: 1.7;
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
            {services.map((service) => (
              <div className="service-card" key={service.title}>
                <i className={`fa-solid ${service.icon} service-icon`}></i>
                <h2 className="service-title">{service.title}</h2>
                <p className="service-desc">{service.desc}</p>
                <button
                  type="button"
                  className="service-learn-btn"
                  onClick={() => setSelectedService(service)}
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedService && (
        <div
          className="service-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedService(null)}
        >
          <section
            className="service-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="service-modal-header">
              <h2 className="service-modal-title" id="service-modal-title">
                {selectedService.title}
              </h2>
              <button
                type="button"
                className="service-modal-close"
                aria-label="Close service details"
                onClick={() => setSelectedService(null)}
              >
                &times;
              </button>
            </div>
            <img
              className="service-modal-image"
              src={selectedService.image}
              alt=""
            />
            <div className="service-modal-body">
              <i className={`fa-solid ${selectedService.icon} service-modal-icon`}></i>
              <p className="service-modal-text">{selectedService.details}</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
