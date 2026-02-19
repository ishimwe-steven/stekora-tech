import React, { useState } from 'react';

export default function ApplyServices() {
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
    console.log('Apply for Services:', form);
    alert('Thank you! Your services application has been sent.');
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
          --accent: #6366f1;
        }

        .apply-page {
          background: var(--palegray);
          min-height: 100vh;
          padding: 3rem 1rem;
        }

        .apply-container {
          max-width: 60rem;
          margin: 0 auto;
        }

        .apply-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .apply-header h1 {
          font-size: 2.1rem;
          font-weight: 700;
          color: var(--richblue);
        }

        .apply-header p {
          color: #555;
          max-width: 40rem;
          margin: 0.75rem auto 0;
          font-size: 0.95rem;
        }

        .apply-card {
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
          border-color: var(--accent);
        }

        .submit-btn {
          margin-top: 1.5rem;
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 0.8rem 1.6rem;
          border-radius: 0.7rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
        }

        .submit-btn:hover {
          background: #4f46e5;
        }
      `}</style>

      <div className="apply-page">
        <div className="apply-container">
          <div className="apply-header">
            <h1>Apply for Services</h1>
            <p>
              Tell us about the services you need and our team will contact you
              with next steps.
            </p>
          </div>

          <div className="apply-card">
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
                    <option>Training & Mentorship</option>
                    <option>Embedded Systems / IoT</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>More Details</label>
                <textarea
                  name="message"
                  placeholder="Share more details about your project or request..."
                  required
                  value={form.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button className="submit-btn">Submit Application</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

