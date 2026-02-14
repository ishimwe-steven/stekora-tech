import React from 'react';

export default function Jobs() {
  return (
    <>
      {/* Internal CSS */}
      <style>
        {`
          :root {
            --richblue: #003366;
            --palegray: #f5f5f5;
            --lightgray: #9ca3af;
          }

          body {
            font-family: 'Inter', sans-serif;
            background-color: var(--palegray);
            color: var(--richblue);
            margin: 0;
            padding: 0;
          }

          .jobs-container {
            max-width: 72rem;
            margin: 0 auto;
            padding: 2.5rem 1rem; /* py-10 px-4 */
          }

          h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }

          p {
            margin: 0;
          }

          .subtitle {
            font-size: 0.875rem;
            color: var(--lightgray);
            margin-bottom: 1.5rem;
          }

          .job-box {
            border: 1px dashed var(--richblue);
            background-color: rgba(0, 51, 102, 0.1); /* semi-transparent rich blue */
            padding: 1.5rem;
            border-radius: 1rem;
          }

          .job-box h2 {
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .job-box p {
            font-size: 0.75rem;
            margin-bottom: 0.75rem;
            color: var(--lightgray);
          }

          .job-box p.email {
            color: var(--richblue);
            margin-bottom: 0;
          }
        `}
      </style>

      {/* Jobs JSX */}
      <div className="jobs-container">
        <h1>Jobs &amp; Opportunities</h1>
        <p className="subtitle">
          We collaborate with developers, designers and hardware enthusiasts on
          IT and electronics projects.
        </p>

        <div className="job-box">
          <h2>No open positions right now</h2>
          <p>
            We're always happy to see strong portfolios. You can still send
            your CV and GitHub/LinkedIn, and we'll keep you in mind for
            future IT projects.
          </p>
          <p className="email">Email: careers@stekoratech.com</p>
        </div>
      </div>
    </>
  );
}
