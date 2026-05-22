import React from 'react';

export default function About() {
  return (
    <>
      <style>{`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
          --lightgray: #9ca3af;
        }

        .about-page {
          background: var(--palegray);
          min-height: 100vh;
          padding: 3rem 1rem;
        }

        .about-container {
          max-width: 72rem;
          margin: 0 auto;
        }

        /* Top info section */
        .about-top {
          display: grid;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 768px) {
          .about-top {
            grid-template-columns: repeat(3, minmax(0,1fr));
          }
        }

        .about-box {
          background: #ffffff;
          border-radius: 0.75rem;
          padding: 1.5rem 1.7rem;
          box-shadow: 0 8px 18px rgba(0,0,0,0.05);
        }

        .about-box h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--richblue);
          margin-bottom: 0.6rem;
        }

        .about-box p {
          font-size: 0.85rem;
          color: #4b5563;
          line-height: 1.6;
        }

        /* Team section */
        .team-section {
          background: #fbfbfb;
          border-radius: 1.5rem;
          padding: 2.5rem 2rem;
          text-align: center;
          margin-bottom: 3rem;
        }

        .team-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--richblue);
          margin-bottom: 0.5rem;
        }

        .team-sub {
          font-size: 0.9rem;
          color: #4b5563;
          max-width: 40rem;
          margin: 0 auto 2rem;
        }

        .team-grid {
          display: grid;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .team-grid {
            grid-template-columns: repeat(3, minmax(0,1fr));
          }
        }

        .team-card {
          background: #ffffff;
          border-radius: 1.25rem;
          padding: 1.8rem 1.4rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
        }

        .team-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 3px solid #22c55e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #9ca3af;
        }

        .team-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--richblue);
        }

        .team-role {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .team-bio {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        /* Partners strip similar to screenshot */
        .partners-strip {
          margin-top: 1rem;
          padding: 2rem 1rem 0;
          text-align: center;
        }

        .partners-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--richblue);
          margin-bottom: 1.5rem;
        }

        .partners-logos {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2.5rem;
          align-items: center;
          font-size: 1.1rem;
          color: #4b5563;
        }

        .partners-logos span {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .team-section {
            padding: 2rem 1.2rem;
          }
        }
      `}</style>

      <div className="about-page">
        <div className="about-container">
          {/* Vision / Mission / Strategy */}
          <div className="about-top">
            <div className="about-box">
              <h3>Our Vision</h3>
              <p>
                To be a reliable technology partner to our clients, delivering
                modern digital solutions for both local and international needs.
              </p>
            </div>
            <div className="about-box">
              <h3>Our Mission</h3>
              <p>
                To solve business challenges with innovative software, embedded
                systems and research while empowering young talent through real
                projects and mentorship.
              </p>
            </div>
            <div className="about-box">
              <h3>Strategic Driving Lines</h3>
              <p>
                Continuous quality improvement, strong customer support and
                partnerships that help us deliver reliable products and services
                to every client we serve.
              </p>
            </div>
          </div>

          {/* Team cards similar to screenshot */}
          <section className="team-section">
            <h2 className="team-title">Our Awesome Team Of Engineers &amp; Staff</h2>
            <p className="team-sub">
              Stekora Tech works with skilled professionals and partners to
              deliver software and electronics solutions in Rwanda and beyond.
            </p>

            <div className="team-grid">
              <div className="team-card">
                <div className="team-avatar">👤</div>
                <div className="team-name">Steven</div>
                <div className="team-role">CEO &amp; Founder</div>
                <div className="team-bio">
                  Leads overall vision, projects and partnerships.
                </div>
              </div>

              <div className="team-card">
                <div className="team-avatar">👤</div>
                <div className="team-name">Tabitha</div>
                <div className="team-role">Chief Technology Officer</div>
                <div className="team-bio">
                  Oversees technology choices and engineering quality.
                </div>
              </div>

              <div className="team-card">
                <div className="team-avatar">👤</div>
                <div className="team-name">Stekora Team</div>
                <div className="team-role">Developers &amp; Mentors</div>
                <div className="team-bio">
                  Collaborate on client work and student projects.
                </div>
              </div>
            </div>

            {/* Partners strip */}
            <div className="partners-strip">
              <div className="partners-label">Our Partners</div>
              <div className="partners-logos">
                <span>Nadev Solution</span>
                <span>Code Rwanda Tech</span>
                <span></span>
                <span></span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
