import React from 'react';
import { useNavigate } from 'react-router-dom';

const COURSES = [
  { id: 1, title: 'Full-Stack Web Development', level: 'Beginner to Advanced' },
  { id: 2, title: 'Frontend with React', level: 'Intermediate' },
  { id: 3, title: 'Backend with Node.js & APIs', level: 'Intermediate' },
  { id: 4, title: 'Embedded Systems & IoT Basics', level: 'Beginner' },
];

export default function Courses() {
  const navigate = useNavigate();

  const handleSelectCourse = (course) => {
    localStorage.setItem('selectedCourse', course.title);
    navigate('/login');
  };

  return (
    <>
      <style>{`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
          --lightgray: #9ca3af;
        }

        .courses-page {
          background: var(--palegray);
          min-height: 100vh;
          padding: 3rem 1rem;
        }

        .courses-container {
          max-width: 72rem;
          margin: 0 auto;
        }

        .courses-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .courses-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--richblue);
        }

        .courses-header p {
          font-size: 0.95rem;
          color: #4b5563;
          max-width: 36rem;
          margin: 0.75rem auto 0;
        }

        .courses-grid {
          display: grid;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .courses-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .course-card {
          background: #ffffff;
          border-radius: 1.2rem;
          padding: 1.8rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.06);
          border-left: 4px solid #6366f1;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .course-title {
          font-weight: 600;
          color: var(--richblue);
          font-size: 1rem;
        }

        .course-level {
          font-size: 0.85rem;
          color: var(--lightgray);
        }

        .course-cta {
          margin-top: 0.75rem;
          align-self: flex-start;
          padding: 0.6rem 1.1rem;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #003366, #6366f1);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .course-cta:hover {
          opacity: 0.9;
        }
      `}</style>

      <div className="courses-page">
        <div className="courses-container">
          <div className="courses-header">
            <h1>Study with Stekora Tech</h1>
            <p>
              Choose a course and continue to login so you can create an account
              and complete your application for study.
            </p>
          </div>

          <div className="courses-grid">
            {COURSES.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-title">{course.title}</div>
                <div className="course-level">{course.level}</div>
                <button
                  className="course-cta"
                  onClick={() => handleSelectCourse(course)}
                >
                  Select course &amp; login
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

