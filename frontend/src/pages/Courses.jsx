import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import fullstackImg from '../assets/image/fullstack.jpg';
import backendImg from '../assets/image/backend.png';
import iotImg from '../assets/image/iot.jpg';
import photoshopImg from '../assets/image/photoshop.jpg';

const FALLBACK_COURSES = [
  {
    id: 'full-stack',
    name: 'Full-Stack Web Development',
    description:
      'Learn how to build complete web applications, from user interfaces to APIs, databases, and deployment.',
  },
  {
    id: 'frontend-react',
    name: 'Frontend with React',
    description:
      'Build responsive, modern user interfaces with React, components, routing, state, and API integration.',
  },
  {
    id: 'backend-node',
    name: 'Backend with Node.js & APIs',
    description:
      'Create secure backend systems with Node.js, Express, REST APIs, authentication, and database logic.',
  },
  {
    id: 'iot-basics',
    name: 'Embedded Systems & IoT Basics',
    description:
      'Explore connected devices, sensors, embedded programming, and the fundamentals of IoT projects.',
  },
];

const COURSE_IMAGES = [fullstackImg, backendImg, iotImg, photoshopImg];
const CATEGORIES = ['All', 'Development', 'Backend', 'IoT', 'Design'];

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
  return `${base}${url}`;
};

const inferCategory = (course) => {
  if (course.category) return course.category;
  const text = `${course.name || ''} ${course.description || ''}`.toLowerCase();
  if (text.includes('iot') || text.includes('embedded')) return 'IoT';
  if (text.includes('backend') || text.includes('api') || text.includes('node')) return 'Backend';
  if (text.includes('design') || text.includes('photo') || text.includes('ui')) return 'Design';
  return 'Development';
};

const buildFallbackCurriculum = (course) => {
  const category = inferCategory(course);

  if (category === 'Backend') {
    return ['Node.js and Express basics', 'REST API structure', 'Database connections', 'Authentication and security'];
  }

  if (category === 'IoT') {
    return ['Embedded systems introduction', 'Sensors and inputs', 'Device communication', 'IoT project build'];
  }

  if (category === 'Design') {
    return ['Design tool basics', 'Layouts and visual hierarchy', 'Responsive interface design', 'Portfolio project'];
  }

  return ['HTML, CSS and JavaScript foundations', 'React components and routing', 'Backend API integration', 'Final full-stack project'];
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
    if (!selectedCourse) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedCourse(null);
        setCurriculum([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCourse]);

  const decoratedCourses = useMemo(
    () =>
      courses.map((course, index) => ({
        ...course,
        category: inferCategory(course),
        image: resolveImageUrl(course.image_url) || COURSE_IMAGES[index % COURSE_IMAGES.length],
      })),
    [courses]
  );

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
      setCurriculum(units.length ? units : buildFallbackCurriculum(course));
    } catch (err) {
      console.error(err);
      setCurriculum(buildFallbackCurriculum(course));
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
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
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
          font-weight: 700;
          letter-spacing: 0.02em;
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
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .course-learn:hover {
          background: var(--richblue);
          border-color: #22d3ee;
          color: #ffffff;
          transform: translateY(-1px);
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
          border: 1px solid rgba(34, 211, 238, 0.35);
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
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
        }

        .course-modal-title-row {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          justify-content: space-between;
        }

        .course-modal h2 {
          margin: 0;
          color: #001f3f;
          font-size: 1.55rem;
          line-height: 1.22;
        }

        .course-modal-close {
          border: 1px solid rgba(0, 51, 102, 0.18);
          background: #f5f5f5;
          color: #003366;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .course-modal-meta {
          display: flex;
          flex-wrap: wrap;
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

        .course-empty {
          grid-column: 1 / -1;
          color: #526175;
          background: #ffffff;
          border: 1px solid rgba(0, 51, 102, 0.14);
          border-radius: 12px;
          padding: 1.2rem;
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

          .course-modal {
            max-height: 90vh;
          }

          .course-modal h2 {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className="courses-page">
        <div className="courses-container">
          <div className="course-tabs" aria-label="Course categories">
            {CATEGORIES.map((category) => (
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
                  <img className="course-image" src={course.image} alt="" />
                  <div className="course-body">
                    <div className="course-category">{course.category}</div>
                    <h2 className="course-title">{course.name}</h2>
                    <p className="course-summary">
                      {(course.description || 'A practical Stekora Tech course built around real learning units.').slice(0, 118)}
                      {(course.description || '').length > 118 ? '...' : ''}
                    </p>
                    <div className="course-footer">
                      <span className="course-count">{buildFallbackCurriculum(course).length * 10}</span>
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
            <div
              className="course-modal-backdrop"
              role="presentation"
              onClick={closeCourseModal}
            >
              <section
                className="course-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="course-modal-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="course-modal-top">
                  <div className="course-modal-kicker">{selectedCourse.category}</div>
                  <div className="course-modal-title-row">
                    <h2 id="course-modal-title">{selectedCourse.name}</h2>
                    <button
                      type="button"
                      className="course-modal-close"
                      aria-label="Close course details"
                      onClick={closeCourseModal}
                    >
                      &times;
                    </button>
                  </div>
                  <div className="course-modal-meta">
                    <span>{buildFallbackCurriculum(selectedCourse).length * 10}</span>
                    <span>Lessons</span>
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
                    ) : (
                      <ul className="curriculum-list">
                        {curriculum.map((unit, index) => (
                          <li key={`${unit}-${index}`}>{unit}</li>
                        ))}
                      </ul>
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
