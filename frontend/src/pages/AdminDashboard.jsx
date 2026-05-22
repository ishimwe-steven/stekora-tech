import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductForm from './ProductForm';

const inferCourseCategory = (course) => {
  const text = `${course.name || ''} ${course.description || ''}`.toLowerCase();
  if (text.includes('iot') || text.includes('embedded')) return 'IoT';
  if (text.includes('backend') || text.includes('api') || text.includes('node')) return 'Backend';
  if (text.includes('design') || text.includes('photo') || text.includes('ui')) return 'Design';
  return 'Development';
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview | courses | modules | materials | quizzes | students | products | settings
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({ id: null, name: '', description: '', image_url: '' });
  const [courseImage, setCourseImage] = useState(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedCourseForModules, setSelectedCourseForModules] = useState('');
  const [modules, setModules] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [materialCourseId, setMaterialCourseId] = useState('');
  const [materialModuleId, setMaterialModuleId] = useState('');
  const [materialModules, setMaterialModules] = useState([]);
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'note', file_url: '' });
  const [materialFile, setMaterialFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [quizCourseId, setQuizCourseId] = useState('');
  const [quizModuleId, setQuizModuleId] = useState('');
  const [quizModules, setQuizModules] = useState([]);
  const [quizForm, setQuizForm] = useState({
    title: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
  });
  const [settingsForm, setSettingsForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [learnOpen, setLearnOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadOverview();
    loadCourses();
    loadProducts();
    loadNotifications();
  }, [navigate]);

  async function loadOverview() {
    try {
      const { data } = await api.get('/admin/overview');
      setOverview(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCourses() {
    try {
      const { data } = await api.get('/courses');
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadModulesForCourse(courseId, forMaterials = false) {
    if (!courseId) return;
    try {
      const { data } = await api.get(`/courses/${courseId}/modules`);
      if (forMaterials) {
        setMaterialModules(data);
      } else {
        setModules(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveCourse(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', courseForm.name);
      formData.append('description', courseForm.description);
      if (courseForm.image_url) {
        formData.append('image_url', courseForm.image_url);
      }
      if (courseImage) {
        formData.append('image', courseImage);
      }

      if (courseForm.id) {
        await api.put(`/courses/${courseForm.id}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      setCourseForm({ id: null, name: '', description: '', image_url: '' });
      setCourseImage(null);
      setCourseModalOpen(false);
      loadCourses();
    } catch (err) {
      console.error(err);
      alert('Failed to save course');
    }
  }

  async function handleDeleteCourse(id) {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      loadCourses();
    } catch (err) {
      console.error(err);
      alert('Failed to delete course');
    }
  }

  async function handleAddModule(e) {
    e.preventDefault();
    if (!selectedCourseForModules) return;
    try {
      await api.post(`/courses/${selectedCourseForModules}/modules`, {
        title: moduleTitle,
      });
      setModuleTitle('');
      loadModulesForCourse(selectedCourseForModules);
    } catch (err) {
      console.error(err);
      alert('Failed to add module');
    }
  }

  async function handleDeleteModule(id) {
    if (!window.confirm('Delete this module?')) return;
    try {
      await api.delete(`/courses/modules/${id}`);
      loadModulesForCourse(selectedCourseForModules);
    } catch (err) {
      console.error(err);
      alert('Failed to delete module');
    }
  }

  async function handleUploadMaterial(e) {
    e.preventDefault();
    if (!materialModuleId) return;

    try {
      const formData = new FormData();
      formData.append('title', materialForm.title);
      formData.append('type', materialForm.type);
      if (materialForm.file_url) {
        formData.append('file_url', materialForm.file_url);
      }
      if (materialFile) {
        formData.append('file', materialFile);
      }
      await api.post(`/courses/modules/${materialModuleId}/materials`, formData);
      setMaterialForm({ title: '', type: 'note', file_url: '' });
      setMaterialFile(null);
      loadModulesForCourse(materialCourseId, true);
      alert('Material uploaded');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to upload material');
    }
  }

  function openCourseModal(course = null) {
    setCourseForm(
      course
        ? {
            id: course.id,
            name: course.name,
            description: course.description || '',
            image_url: course.image_url || '',
          }
        : { id: null, name: '', description: '', image_url: '' }
    );
    setCourseImage(null);
    setCourseModalOpen(true);
  }

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
    return `${base}${url}`;
  };

  async function loadNotifications() {
    try {
      const { data } = await api.get('/courses/completions');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadQuizForModule(moduleId) {
    if (!moduleId) return;
    try {
      const { data } = await api.get(`/courses/modules/${moduleId}/quiz`);
      if (data) {
        setQuizForm({
          title: data.title || '',
          question: data.question || '',
          option_a: data.option_a || '',
          option_b: data.option_b || '',
          option_c: data.option_c || '',
          option_d: data.option_d || '',
          correct_option: data.correct_option || 'A',
        });
      } else {
        setQuizForm({
          title: '',
          question: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: 'A',
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveQuiz(e) {
    e.preventDefault();
    if (!quizModuleId) return;
    try {
      await api.post(`/courses/modules/${quizModuleId}/quiz`, quizForm);
      alert('Quiz saved for this unit');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to save quiz');
    }
  }

  async function loadStudents() {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateStudentStatus(id, status) {
    try {
      await api.patch(`/students/${id}/status`, { status });
      loadStudents();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  }

  async function loadProducts() {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  }

  function renderOverview() {
    if (!overview) {
      return <p className="admin-sub">Loading overview...</p>;
    }
    return (
        <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-label">Total Students</div>
          <div className="admin-card-number">{overview.totals.students}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Total Courses</div>
          <div className="admin-card-number">{overview.totals.courses}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Total Materials</div>
          <div className="admin-card-number">{overview.totals.materials}</div>
        </div>
        <div className="admin-card admin-card-wide">
          <div className="admin-card-label">Recent Unit Completion Notifications</div>
          <ul className="admin-list">
            {notifications.slice(0, 5).map((n) => (
              <li key={n.id}>
                <strong>{n.student_name}</strong> completed {n.module_title} ({n.course_name || 'Course'})
              </li>
            ))}
            {notifications.length === 0 && <li>No unit completions yet.</li>}
          </ul>
        </div>
        <div className="admin-card admin-card-wide">
          <div className="admin-card-label">Recent Students</div>
          <ul className="admin-list">
            {overview.recentStudents.map((s) => (
              <li key={s.id}>
                <strong>{s.full_name}</strong> — {s.course_name || 'No course'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  function renderCourses() {
    return (
      <div className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2 className="admin-title">Courses</h2>
            <p className="admin-sub">
              Manage the same courses that appear on the public course page.
            </p>
          </div>
          <button type="button" className="admin-primary-btn" onClick={() => openCourseModal()}>
            Add course
          </button>
        </div>

        <div className="admin-course-grid">
          {courses.map((c) => (
            <article className="admin-course-card" key={c.id}>
              {c.image_url && (
                <img className="admin-course-image" src={resolveImageUrl(c.image_url)} alt="" />
              )}
              <div className="admin-course-category">{inferCourseCategory(c)}</div>
              <h3>{c.name}</h3>
              <p>{c.description || 'No course description yet.'}</p>
              <div className="admin-course-actions">
                <button
                  type="button"
                  onClick={() => openCourseModal(c)}
                >
                  Edit course
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('modules');
                    setSelectedCourseForModules(String(c.id));
                    loadModulesForCourse(c.id);
                  }}
                >
                  Curriculum
                </button>
              </div>
            </article>
          ))}
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  {c.image_url ? (
                    <img className="admin-table-image" src={resolveImageUrl(c.image_url)} alt="" />
                  ) : (
                    '—'
                  )}
                </td>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => openCourseModal(c)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(c.id)}
                    style={{ marginLeft: '0.5rem', color: '#b91c1c' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courseModalOpen && (
          <div className="admin-modal-backdrop" role="presentation" onClick={() => setCourseModalOpen(false)}>
            <form
              className="admin-modal"
              onSubmit={handleSaveCourse}
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-head">
                <h3>{courseForm.id ? 'Update course' : 'Add course'}</h3>
                <button type="button" onClick={() => setCourseModalOpen(false)} aria-label="Close course form">
                  X
                </button>
              </div>
              <label>Course name</label>
              <input
                type="text"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                required
              />
              <label>Description</label>
              <input
                type="text"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
              <label>Course image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCourseImage(e.target.files[0] || null)}
              />
              {courseForm.image_url && !courseImage && (
                <img className="admin-modal-preview" src={resolveImageUrl(courseForm.image_url)} alt="" />
              )}
              <button type="submit" className="admin-primary-btn">
                {courseForm.id ? 'Update course' : 'Add course'}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  function renderModules() {
    return (
      <div className="admin-section">
        <h2 className="admin-title">Modules per Course</h2>
        <div className="admin-form-row">
          <select
            value={selectedCourseForModules}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedCourseForModules(v);
              loadModulesForCourse(v);
            }}
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCourseForModules && (
          <>
            <form className="admin-form" onSubmit={handleAddModule}>
              <div className="admin-form-row">
                <input
                  type="text"
                  placeholder="Module title"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  required
                />
                <button type="submit">Add module</button>
              </div>
            </form>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Materials</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.title}</td>
                    <td>{m.materials_count}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(m.id)}
                        style={{ color: '#b91c1c' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    );
  }

  function renderMaterials() {
    return (
      <div className="admin-section">
        <h2 className="admin-title">Upload Notes &amp; Videos</h2>

        <div className="admin-form-row">
          <select
            value={materialCourseId}
            onChange={(e) => {
              const v = e.target.value;
              setMaterialCourseId(v);
              setMaterialModuleId('');
              loadModulesForCourse(v, true);
            }}
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={materialModuleId}
            onChange={(e) => setMaterialModuleId(e.target.value)}
          >
            <option value="">Select module</option>
            {materialModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {materialModuleId && (
          <form className="admin-form" onSubmit={handleUploadMaterial}>
            <div className="admin-form-row">
              <input
                type="text"
                placeholder="Material title"
                value={materialForm.title}
                onChange={(e) =>
                  setMaterialForm({ ...materialForm, title: e.target.value })
                }
                required
              />
              <select
                value={materialForm.type}
                onChange={(e) =>
                  setMaterialForm({ ...materialForm, type: e.target.value })
                }
              >
                <option value="note">Note (PDF / Doc)</option>
                <option value="video">Video</option>
              </select>
              <input
                type="text"
                placeholder="File URL or YouTube link (optional)"
                value={materialForm.file_url}
                onChange={(e) =>
                  setMaterialForm({ ...materialForm, file_url: e.target.value })
                }
              />
              <input
                type="file"
                accept={materialForm.type === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf'}
                onChange={(e) => setMaterialFile(e.target.files[0] || null)}
              />
              <button type="submit">Upload</button>
            </div>
          </form>
        )}
      </div>
    );
  }

  function renderQuizzes() {
    return (
      <div className="admin-section">
        <h2 className="admin-title">Unit Quiz</h2>
        <p className="admin-sub">
          Select a course unit and set the quiz students should answer after learning it.
        </p>

        <div className="admin-form-row" style={{ marginBottom: '1rem' }}>
          <select
            value={quizCourseId}
            onChange={(e) => {
              const v = e.target.value;
              setQuizCourseId(v);
              setQuizModuleId('');
              setQuizModules([]);
              if (v) {
                api.get(`/courses/${v}/modules`).then(({ data }) => setQuizModules(data)).catch(console.error);
              }
            }}
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={quizModuleId}
            onChange={(e) => {
              const v = e.target.value;
              setQuizModuleId(v);
              loadQuizForModule(v);
            }}
          >
            <option value="">Select unit</option>
            {quizModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {quizModuleId && (
          <form className="admin-form" onSubmit={handleSaveQuiz}>
            <div className="admin-form-column admin-form-wide">
              <label>Quiz title</label>
              <input
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                required
              />

              <label>Question</label>
              <input
                value={quizForm.question}
                onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                required
              />

              <label>Option A</label>
              <input
                value={quizForm.option_a}
                onChange={(e) => setQuizForm({ ...quizForm, option_a: e.target.value })}
                required
              />

              <label>Option B</label>
              <input
                value={quizForm.option_b}
                onChange={(e) => setQuizForm({ ...quizForm, option_b: e.target.value })}
                required
              />

              <label>Option C</label>
              <input
                value={quizForm.option_c}
                onChange={(e) => setQuizForm({ ...quizForm, option_c: e.target.value })}
              />

              <label>Option D</label>
              <input
                value={quizForm.option_d}
                onChange={(e) => setQuizForm({ ...quizForm, option_d: e.target.value })}
              />

              <label>Correct answer</label>
              <select
                value={quizForm.correct_option}
                onChange={(e) => setQuizForm({ ...quizForm, correct_option: e.target.value })}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>

              <button type="submit">Save quiz</button>
            </div>
          </form>
        )}
      </div>
    );
  }

  function renderStudents() {
    if (students.length === 0) {
      // load on first open
      loadStudents();
    }
    return (
      <div className="admin-section">
        <h2 className="admin-title">Students</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.full_name}</td>
                <td>{s.email}</td>
                <td>{s.course_name || '—'}</td>
                <td>{s.status}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => updateStudentStatus(s.id, 'active')}
                  >
                    Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStudentStatus(s.id, 'blocked')}
                    style={{ marginLeft: '0.5rem', color: '#b91c1c' }}
                  >
                    Block
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderProducts() {
    return (
      <div className="admin-section">
        <h2 className="admin-title">Add Product</h2>
        <p className="admin-sub">
          Create or edit products that will appear on the public shop page.
        </p>

        <ProductForm
          initial={editingProduct}
          onSuccess={() => {
            setEditingProduct(null);
            loadProducts();
          }}
        />

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(p)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(p.id)}
                    style={{ marginLeft: '0.5rem', color: '#b91c1c' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    if (settingsForm.new_password !== settingsForm.confirm_password) {
      alert('New password and confirmation do not match');
      return;
    }
    try {
      await api.post('/auth/change-password', {
        current_password: settingsForm.current_password,
        new_password: settingsForm.new_password,
      });
      alert('Password updated');
      setSettingsForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to update password');
    }
  }

  function renderSettings() {
    return (
      <div className="admin-section">
        <h2 className="admin-title">Account Settings</h2>
        <p className="admin-sub">
          Update your password and manage your administrator account.
        </p>

        <form className="admin-form" onSubmit={handleSaveSettings}>
          <div className="admin-form-column">
            <label>Current password</label>
            <input
              type="password"
              value={settingsForm.current_password}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  current_password: e.target.value,
                })
              }
              required
            />

            <label>New password</label>
            <input
              type="password"
              value={settingsForm.new_password}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  new_password: e.target.value,
                })
              }
              required
            />

            <label>Confirm new password</label>
            <input
              type="password"
              value={settingsForm.confirm_password}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  confirm_password: e.target.value,
                })
              }
              required
            />

            <button type="submit">Save changes</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <style>{`
        :root {
          --admin-bg: #f5f5f5;
          --admin-sidebar: #1f2f45;
          --admin-sidebar-deep: #17253a;
          --admin-blue: #003366;
          --admin-cyan: #22d3ee;
          --admin-line: #d8dee8;
          --admin-text: #07152c;
          --admin-muted: #64748b;
        }

        .admin-layout {
          min-height: 100vh;
          display: flex;
          background: var(--admin-bg);
          font-family: 'Inter', sans-serif;
        }

        .admin-sidebar {
          width: 240px;
          background: var(--admin-sidebar);
          color: #ffffff;
          padding: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.08);
        }

        .admin-sidebar h1 {
          font-size: 1rem;
          margin: 0;
          padding: 1.45rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }

        .admin-menu {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-size: 0.85rem;
          padding: 1rem 0.7rem;
        }

        .admin-menu button {
          padding: 0.62rem 0.6rem;
          border-radius: 0.35rem;
          border: none;
          background: transparent;
          color: #ffffff;
          text-align: left;
          cursor: pointer;
          font-weight: 600;
        }

        .admin-menu button.active {
          background: rgba(255,255,255,0.14);
          color: #ffffff;
        }

        .admin-menu-label {
          color: #a8c4e8;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 1rem 0.6rem 0.25rem;
        }

        .admin-main {
          flex: 1;
          min-width: 0;
        }

        .admin-topbar {
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.7rem;
          background: #ffffff;
          border-bottom: 1px solid var(--admin-line);
        }

        .admin-topbar-title {
          color: var(--admin-text);
          font-size: 1rem;
          font-weight: 800;
        }

        .admin-role {
          color: #475569;
          font-size: 0.8rem;
        }

        .admin-content {
          padding: 1.7rem;
        }

        .admin-title {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 0 0 0.55rem;
          color: var(--admin-text);
        }

        .admin-sub {
          font-size: 0.86rem;
          color: var(--admin-muted);
          margin: 0 0 1.2rem;
        }

        .admin-grid {
          display: grid;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .admin-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .admin-card {
          background: #ffffff;
          border-radius: 0.5rem;
          padding: 1.2rem 1.4rem;
          border: 1px solid var(--admin-line);
          box-shadow: none;
        }

        .admin-card-wide {
          grid-column: span 3;
        }

        .admin-card-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.35rem;
        }

        .admin-card-number {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--admin-blue);
        }

        .admin-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.85rem;
          color: #374151;
        }

        .admin-section {
          background: #ffffff;
          border-radius: 0.5rem;
          padding: 1.5rem;
          border: 1px solid var(--admin-line);
          box-shadow: none;
        }

        .admin-section-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .admin-primary-btn {
          padding: 0.65rem 1rem;
          border-radius: 0.35rem;
          border: none;
          background: var(--admin-blue);
          color: white;
          font-size: 0.85rem;
          font-weight: 800;
          cursor: pointer;
        }

        .admin-form {
          margin-bottom: 1.25rem;
        }

        .admin-form-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .admin-form-column {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          max-width: 360px;
        }

        .admin-form-row input,
        .admin-form-row select,
        .admin-form-column input,
        .admin-form-column select {
          padding: 0.65rem 0.75rem;
          border-radius: 0.35rem;
          border: 1px solid var(--admin-line);
          font-size: 0.85rem;
        }

        .admin-form-wide {
          max-width: 720px;
        }

        .admin-form-column button {
          align-self: flex-start;
          padding: 0.65rem 1rem;
          border-radius: 0.35rem;
          border: none;
          background: var(--admin-blue);
          color: white;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .admin-form-row button {
          padding: 0.65rem 1rem;
          border-radius: 0.35rem;
          border: none;
          background: var(--admin-blue);
          color: white;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .admin-course-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          margin-bottom: 1.35rem;
        }

        .admin-course-card {
          border: 1px solid var(--admin-line);
          border-radius: 0.5rem;
          background: #f8fbff;
          padding: 1rem;
          overflow: hidden;
        }

        .admin-course-image {
          width: calc(100% + 2rem);
          margin: -1rem -1rem 0.8rem;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          background: #e8eef6;
        }

        .admin-course-category {
          color: var(--admin-cyan);
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .admin-course-card h3 {
          margin: 0;
          color: var(--admin-text);
          font-size: 0.98rem;
        }

        .admin-course-card p {
          min-height: 3.4rem;
          margin: 0.55rem 0 0.9rem;
          color: var(--admin-muted);
          line-height: 1.5;
          font-size: 0.84rem;
        }

        .admin-course-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .admin-course-actions button {
          border: 1px solid rgba(0, 51, 102, 0.18);
          background: #ffffff;
          color: var(--admin-blue);
          border-radius: 999px;
          padding: 0.45rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          font-size: 0.85rem;
        }

        .admin-table th,
        .admin-table td {
          border-bottom: 1px solid #e5e7eb;
          padding: 0.5rem 0.4rem;
          text-align: left;
        }

        .admin-table th {
          font-weight: 600;
          color: #374151;
        }

        .admin-table td button {
          border: none;
          background: transparent;
          color: var(--admin-blue);
          cursor: pointer;
          font-size: 0.8rem;
        }

        .admin-table-image {
          width: 54px;
          height: 36px;
          object-fit: cover;
          border-radius: 0.3rem;
          border: 1px solid var(--admin-line);
        }

        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(7, 21, 44, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .admin-modal {
          width: min(480px, 100%);
          background: #ffffff;
          border: 1px solid var(--admin-line);
          border-radius: 0.5rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .admin-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .admin-modal-head h3 {
          margin: 0;
          color: var(--admin-text);
          font-size: 1rem;
        }

        .admin-modal-head button {
          border: none;
          background: transparent;
          color: var(--admin-text);
          cursor: pointer;
          font-weight: 900;
        }

        .admin-modal label {
          color: var(--admin-muted);
          font-size: 0.8rem;
          font-weight: 800;
        }

        .admin-modal input {
          padding: 0.65rem 0.75rem;
          border-radius: 0.35rem;
          border: 1px solid var(--admin-line);
          font-size: 0.85rem;
        }

        .admin-modal-preview {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: 0.45rem;
          border: 1px solid var(--admin-line);
        }

        @media (max-width: 768px) {
          .admin-layout {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
          }

          .admin-course-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h1>Stekora Admin</h1>
          <div className="admin-menu">
            <button
              type="button"
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Dashboard
            </button>

            <div className="admin-menu-label">Catalog</div>
            {/* Learn dropdown */}
            <button
              type="button"
              onClick={() => setLearnOpen(!learnOpen)}
              style={{ fontWeight: 600 }}
            >
              {learnOpen ? '▼ ' : '▶ '}Learn
            </button>
            {learnOpen && (
              <div style={{ paddingLeft: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                  type="button"
                  className={activeTab === 'courses' ? 'active' : ''}
                  onClick={() => setActiveTab('courses')}
                >
                  Courses
                </button>
                <button
                  type="button"
                  className={activeTab === 'modules' ? 'active' : ''}
                  onClick={() => setActiveTab('modules')}
                >
                  Modules
                </button>
                <button
                  type="button"
                  className={activeTab === 'materials' ? 'active' : ''}
                  onClick={() => setActiveTab('materials')}
                >
                  Materials
                </button>
                <button
                  type="button"
                  className={activeTab === 'quizzes' ? 'active' : ''}
                  onClick={() => setActiveTab('quizzes')}
                >
                  Quizzes
                </button>
                <button
                  type="button"
                  className={activeTab === 'students' ? 'active' : ''}
                  onClick={() => {
                    setActiveTab('students');
                    loadStudents();
                  }}
                >
                  Students
                </button>
              </div>
            )}

            <div className="admin-menu-label">Shop</div>
            <button
              type="button"
              className={activeTab === 'products' ? 'active' : ''}
              onClick={() => setActiveTab('products')}
            >
              Add product
            </button>

            <div className="admin-menu-label">Site</div>
            <button
              type="button"
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-title">
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'courses' && 'Courses'}
              {activeTab === 'modules' && 'Curriculum'}
              {activeTab === 'materials' && 'Materials'}
              {activeTab === 'quizzes' && 'Quizzes'}
              {activeTab === 'students' && 'Students'}
              {activeTab === 'products' && 'Products'}
              {activeTab === 'settings' && 'Settings'}
            </div>
            <div className="admin-role">Super Admin</div>
          </header>

          <div className="admin-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'courses' && renderCourses()}
            {activeTab === 'modules' && renderModules()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'quizzes' && renderQuizzes()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>
    </>
  );
}
