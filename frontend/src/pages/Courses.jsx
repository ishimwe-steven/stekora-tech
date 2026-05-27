import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import fullstackImg from '../assets/image/fullstack.jpg';
import backendImg from '../assets/image/backend.png';
import iotImg from '../assets/image/iot.jpg';
import photoshopImg from '../assets/image/photoshop.jpg';

const FALLBACK_COURSES = [];
const COURSE_IMAGES = [fullstackImg, backendImg, iotImg, photoshopImg];

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
  return `${base}${url}`;
};

const getCourseCategory = (course) => {
  return course.category?.trim() || 'Uncategorized';
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [curriculumLoading, setCurriculumLoading] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const { data } = await api.get('/courses');
        setCourses(data.length ? data : FALLBACK_COURSES);
      } catch (err) {
        console.error(err);
        setCourses(FALLBACK_COURSES);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeCourseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCourse]);

  const decoratedCourses = useMemo(
    () =>
      courses.map((course, index) => ({
        ...course,
        category: getCourseCategory(course),
        image:
          resolveImageUrl(course.image_url) ||
          COURSE_IMAGES[index % COURSE_IMAGES.length],
      })),
    [courses]
  );

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(decoratedCourses.map((course) => course.category)),
    ];

    return ['All', ...uniqueCategories];
  }, [decoratedCourses]);

  const visibleCourses = decoratedCourses.filter(
    (course) => activeCategory === 'All' || course.category === activeCategory
  );

  const handleLearnMore = async (course) => {
    setSelectedCourse(course);
    setCurriculum([]);
    setCurriculumLoading(true);

    try {
      const { data } = await api.get(`/courses/${course.id}/modules`);
      const units = data.map((module) => module.title).filter(Boolean);
      setCurriculum(units);
    } catch (err) {
      console.error(err);
      setCurriculum([]);
    } finally {
      setCurriculumLoading(false);
    }
  };

  const closeCourseModal = () => {
    setSelectedCourse(null);
    setCurriculum([]);
  };

  return (
    <>
      <style>{`
        :root {
          --blue: #3b82f6;
          --richblue: #003366;
        }

        .courses-page {
          min-height: 100vh;
          background: #f5f5f5;
          padding: 4.25rem 1rem 5rem;
          color: #003366;
        }

        .courses-container {
          width: min(1520px, 100%);
          margin: 0 auto;
        }

        .course-tabs {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 3.2rem;
        }

        .course-tab {
          border: 0;
          border-radius: 999px;
          background: #e8eef6;
          color: #003366;
          min-height: 44px;
          padding: 0 1.2rem;
          font-size: 0.96rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .course-tab:hover {
          transform: translateY(-1px);
        }

        .course-tab.active {
          background: #003366;
          color: #ffffff;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 2.2rem;
        }

        .course-card {
          background: #ffffff;
          border: 1px solid rgba(0, 51, 102, 0.14);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          min-height: 496px;
          flex-direction: column;
          box-shadow: 0 10px 24px rgba(0, 51, 102, 0.06);
        }

        .course-image {
          width: 100%;
          height: 270px;
          object-fit: cover;
          background: #dbe6f3;
        }

        .course-body {
          padding: 1.8rem 1.6rem 1.45rem;
          display: flex;
          flex: 1;
          flex-direction: column;
        }

        .course-category {
          color: #22d3ee;
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .course-title {
          margin: 0;
          color: #001f3f;
          font-size: 1.05rem;
          font-weight: 800;
          line-height: 1.35;
        }

        .course-summary {
          margin: 0.9rem 0 1.35rem;
          color: #526175;
          font-size: 0.98rem;
          line-height: 1.48;
        }

        .course-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .course-count {
          color: #526175;
          font-size: 0.96rem;
        }

        .course-learn {
          border: 1px solid var(--blue);
          background: var(--blue);
          color: #ffffff;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          padding: 0.65rem 1rem;
          min-width: 112px;
        }

        .course-learn:hover {
          background: var(--richblue);
          border-color: #22d3ee;
        }

        .course-empty {
          grid-column: 1 / -1;
          color: #526175;
          background: #ffffff;
          border: 1px solid rgba(0, 51, 102, 0.14);
          border-radius: 12px;
          padding: 1.2rem;
        }

        .course-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0, 31, 63, 0.58);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .course-modal {
          width: min(720px, 100%);
          max-height: min(86vh, 760px);
          overflow: auto;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 24px 60px rgba(0, 31, 63, 0.28);
        }

        .course-modal-top {
          padding: 1.35rem 1.45rem 1.15rem;
          border-bottom: 1px solid rgba(0, 51, 102, 0.12);
        }

        .course-modal-kicker {
          color: #22d3ee;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
        }

        .course-modal-title-row {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
        }

        .course-modal h2 {
          margin: 0;
          color: #001f3f;
          font-size: 1.55rem;
        }

        .course-modal-close {
          border: 1px solid rgba(0, 51, 102, 0.18);
          background: #f5f5f5;
          color: #003366;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .course-modal-meta {
          display: flex;
          gap: 0.8rem;
          margin-top: 0.75rem;
          color: #526175;
          font-size: 0.8rem;
        }

        .course-modal-content {
          padding: 1.35rem 1.45rem 1.5rem;
          display: grid;
          gap: 1.35rem;
        }

        .course-modal-section h3 {
          margin: 0 0 0.6rem;
          color: #001f3f;
          font-size: 1rem;
        }

        .course-modal-section p {
          margin: 0;
          color: #526175;
          line-height: 1.65;
        }

        .curriculum-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 0.65rem;
        }

        .curriculum-list li {
          border: 1px solid rgba(0, 51, 102, 0.15);
          border-radius: 8px;
          padding: 0.75rem 0.9rem;
          color: #003366;
          background: #f8fbff;
          font-size: 0.92rem;
        }

        @media (max-width: 1020px) {
          .courses-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .courses-page {
            padding-top: 2.2rem;
          }

          .course-tabs {
            margin-bottom: 1.5rem;
          }

          .courses-grid {
            grid-template-columns: 1fr;
          }

          .course-card {
            min-height: auto;
          }

          .course-image {
            height: 210px;
          }

          .course-modal h2 {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className="courses-page">
        <div className="courses-container">
          <div className="course-tabs">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`course-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="courses-grid">
            {loading && <div className="course-empty">Loading courses...</div>}

            {!loading &&
              visibleCourses.map((course) => (
                <article key={course.id} className="course-card">
                  <img className="course-image" src={course.image} alt={course.name} />

                  <div className="course-body">
                    <div className="course-category">{course.category}</div>

                    <h2 className="course-title">{course.name}</h2>

                    <p className="course-summary">
                      {(course.description ||
                        'A practical Stekora Tech course built around real learning units.'
                      ).slice(0, 118)}
                      {(course.description || '').length > 118 ? '...' : ''}
                    </p>

                    <div className="course-footer">
                      <span className="course-count">
                        {course.modules_count || course.module_count || 0} Lessons
                      </span>

                      <button
                        type="button"
                        className="course-learn"
                        onClick={() => handleLearnMore(course)}
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </article>
              ))}

            {!loading && visibleCourses.length === 0 && (
              <div className="course-empty">No courses found in this category.</div>
            )}
          </div>

          {selectedCourse && (
            <div className="course-modal-backdrop" onClick={closeCourseModal}>
              <section
                className="course-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="course-modal-top">
                  <div className="course-modal-kicker">
                    {selectedCourse.category}
                  </div>

                  <div className="course-modal-title-row">
                    <h2>{selectedCourse.name}</h2>

                    <button
                      type="button"
                      className="course-modal-close"
                      onClick={closeCourseModal}
                    >
                      &times;
                    </button>
                  </div>

                  <div className="course-modal-meta">
                    <span>{curriculum.length} Lessons</span>
                    <span>Free</span>
                  </div>
                </div>

                <div className="course-modal-content">
                  <div className="course-modal-section">
                    <h3>About this course</h3>
                    <p>
                      {selectedCourse.description ||
                        'This course gives students practical skills through guided lessons, project work, and clear learning units.'}
                    </p>
                  </div>

                  <div className="course-modal-section">
                    <h3>Curriculum</h3>

                    {curriculumLoading ? (
                      <p>Loading curriculum...</p>
                    ) : curriculum.length > 0 ? (
                      <ul className="curriculum-list">
                        {curriculum.map((unit, index) => (
                          <li key={`${unit}-${index}`}>{unit}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No module has been uploaded for this course yet.</p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}