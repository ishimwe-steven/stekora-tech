import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // For now (frontend only)
    console.log('Job Request:', form);
    alert('Thank you! Your request has been sent.');

    setForm({
      name: '',
      email: '',
      phone: '',
      service: '',
      message: '',
    });
  };

  return (
    <>
      <style>{`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
          --lightgray: #9ca3af;
          --yellow: #facc15;
        }

        .contact-page {
          background: var(--palegray);
          min-height: 100vh;
          padding: 3rem 1rem;
        }

        .contact-container {
          max-width: 60rem;
          margin: 0 auto;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .contact-header h1 {
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--richblue);
        }

        .contact-header p {
          color: #555;
          max-width: 40rem;
          margin: 0.75rem auto 0;
          font-size: 0.95rem;
        }

        .contact-card {
          background: #fff;
          border-radius: 1.2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          padding: 2.5rem;
        }

        .form-grid {
          display: grid;
          gap: 1.25rem;
        }

        @media(min-width: 640px) {
          .form-grid.two {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .form-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: var(--richblue);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.65rem 0.75rem;
          border-radius: 0.6rem;
          border: 1px solid var(--lightgray);
          font-size: 0.85rem;
          outline: none;
        }

        .form-group textarea {
          resize: none;
          min-height: 120px;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--richblue);
        }

        .submit-btn {
          margin-top: 1.5rem;
          background: var(--blue);
          color: #fff;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 0.7rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-btn:hover {
          background: #00264d;
        }

        .badge {
          display: inline-block;
          background: var(--yellow);
          color: #000;
          font-size: 0.7rem;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          font-weight: 600;
          margin-bottom: 0.6rem;
        }
      `}</style>

      <div className="contact-page">
        <div className="contact-container">
          <div className="contact-header">
            <span className="badge">Contact Us</span>
            <h1>Request a Project / Job</h1>
            <p>
              Need a website, mobile app, IoT system or custom IT solution?
              Fill in the form below and our team will get back to you.
            </p>
          </div>

          <div className="contact-card">
            <form onSubmit={handleSubmit}>
              <div className="form-grid two">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="enter your email address"
                  />
                </div>
              </div>

              <div className="form-grid two">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Service Needed</label>
                  <select
                    name="service"
                    required
                    value={form.service}
                    onChange={handleChange}
                  >
                    <option value="">Select a service</option>
                    <option>Website Development</option>
                    <option>Mobile App Development</option>
                    <option>IoT / Embedded Systems</option>
                    <option>Automation & Integration</option>
                    <option>Other services</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Write a message</label>
                <textarea
                  name="message"
                  placeholder="write us a message..."
                  required
                  value={form.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button className="submit-btn">
                <i className="fa-solid fa-paper-plane"></i>
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}