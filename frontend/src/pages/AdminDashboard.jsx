import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductForm from './ProductForm';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview | courses | modules | materials | students | products | settings
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({ id: null, name: '', description: '' });
  const [selectedCourseForModules, setSelectedCourseForModules] = useState('');
  const [modules, setModules] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [materialCourseId, setMaterialCourseId] = useState('');
  const [materialModuleId, setMaterialModuleId] = useState('');
  const [materialModules, setMaterialModules] = useState([]);
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'note', file_url: '' });
  const [students, setStudents] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
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
      if (courseForm.id) {
        await api.put(`/courses/${courseForm.id}`, {
          name: courseForm.name,
          description: courseForm.description,
        });
      } else {
        await api.post('/courses', {
          name: courseForm.name,
          description: courseForm.description,
        });
      }
      setCourseForm({ id: null, name: '', description: '' });
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
      await api.post(`/courses/modules/${materialModuleId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaterialForm({ title: '', type: 'note', file_url: '' });
      alert('Material uploaded');
    } catch (err) {
      console.error(err);
      alert('Failed to upload material');
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
        <h2 className="admin-title">Courses</h2>
        <form className="admin-form" onSubmit={handleSaveCourse}>
          <div className="admin-form-row">
            <input
              type="text"
              placeholder="Course name"
              value={courseForm.name}
              onChange={(e) =>
                setCourseForm({ ...courseForm, name: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm({ ...courseForm, description: e.target.value })
              }
            />
            <button type="submit">
              {courseForm.id ? 'Update' : 'Add'} course
            </button>
          </div>
        </form>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      setCourseForm({
                        id: c.id,
                        name: c.name,
                        description: c.description || '',
                      })
                    }
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
              <button type="submit">Upload</button>
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
          --admin-sidebar: #0f172a;
          --admin-blue: #1d4ed8;
        }

        .admin-layout {
          min-height: 100vh;
          display: flex;
          background: var(--admin-bg);
          font-family: 'Inter', sans-serif;
        }

        .admin-sidebar {
          width: 230px;
          background: var(--admin-sidebar);
          color: #e5e7eb;
          padding: 1.6rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-sidebar h1 {
          font-size: 1.1rem;
          margin: 0;
        }

        .admin-menu {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.85rem;
        }

        .admin-menu button {
          padding: 0.4rem 0.5rem;
          border-radius: 0.4rem;
          border: none;
          background: transparent;
          color: #e5e7eb;
          text-align: left;
          cursor: pointer;
        }

        .admin-menu button.active {
          background: rgba(59,130,246,0.3);
          color: #bfdbfe;
        }

        .admin-main {
          flex: 1;
          padding: 2rem 1.5rem;
        }

        .admin-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #0f172a;
        }

        .admin-sub {
          font-size: 0.9rem;
          color: #4b5563;
          margin-bottom: 1.5rem;
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
          border-radius: 1rem;
          padding: 1.2rem 1.4rem;
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
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
          border-radius: 1.25rem;
          padding: 1.5rem 1.7rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.06);
        }

        .admin-form {
          margin-bottom: 1rem;
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
        .admin-form-column input {
          padding: 0.55rem 0.75rem;
          border-radius: 0.6rem;
          border: 1px solid #d1d5db;
          font-size: 0.85rem;
        }

        .admin-form-row button {
          padding: 0.55rem 1rem;
          border-radius: 0.6rem;
          border: none;
          background: var(--admin-blue);
          color: white;
          font-size: 0.85rem;
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

        @media (max-width: 768px) {
          .admin-layout {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
      `}</style>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h1>Admin Panel</h1>
          <div className="admin-menu">
            <button
              type="button"
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Dashboard
            </button>

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

            <button
              type="button"
              className={activeTab === 'products' ? 'active' : ''}
              onClick={() => setActiveTab('products')}
            >
              Add product
            </button>

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
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'modules' && renderModules()}
          {activeTab === 'materials' && renderMaterials()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </>
  );
}
