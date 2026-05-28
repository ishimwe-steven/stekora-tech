import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductForm from './ProductForm';

const inferCourseCategory = (course) => {
  if (course.category) return course.category;
  const text = `${course.name || ''} ${course.description || ''}`.toLowerCase();
  if (text.includes('iot') || text.includes('embedded')) return 'IoT';
  if (text.includes('backend') || text.includes('api') || text.includes('node')) return 'Backend';
  if (text.includes('design') || text.includes('photo') || text.includes('ui')) return 'Design';
  return 'Development';
};

const COURSE_CATEGORIES = ['Development', 'Backend', 'IoT', 'Design'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview | courses | modules | materials | quizzes | finalExam | students | products | settings
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
 const [courseForm, setCourseForm] = useState({
  id: null,
  name: '',
  description: '',
  category: 'Development',
  image_url: '',
  modules: [''],
});
  const [courseImage, setCourseImage] = useState(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedCourseForModules, setSelectedCourseForModules] = useState('');
  const [modules, setModules] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [materialCourseId, setMaterialCourseId] = useState('');
  const [materialModuleId, setMaterialModuleId] = useState('');
  const [materialModules, setMaterialModules] = useState([]);
  const [materialForm, setMaterialForm] = useState({
  id: null,
  title: '',
  type: 'section',
  file_url: '',
  content: '',
})
  const [materialFile, setMaterialFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [tableSearch, setTableSearch] = useState({
    courses: '',
    modules: '',
    students: '',
    products: '',
    finalExam: '',
  });
  const emptyAssessmentQuestion = {
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
  };

  const [quizCourseId, setQuizCourseId] = useState('');
  const [quizModuleId, setQuizModuleId] = useState('');
  const [quizModules, setQuizModules] = useState([]);
  const [quizForm, setQuizForm] = useState({
    title: 'Section Assessment',
    questions: [
      { ...emptyAssessmentQuestion },
      { ...emptyAssessmentQuestion },
      { ...emptyAssessmentQuestion },
    ],
  });
  const [settingsForm, setSettingsForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [learnOpen, setLearnOpen] = useState(true);
  const emptyFinalExamQuestion = {
    question_type: 'mcq',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    marks: 1,
  };

  const [finalExamCourseId, setFinalExamCourseId] = useState('');
  const [finalExamQuestions, setFinalExamQuestions] = useState([
    { ...emptyFinalExamQuestion },
  ]);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewScores, setReviewScores] = useState({});
  const [reviewComment, setReviewComment] = useState('');

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

  function filterTableRows(rows, tableKey, fields) {
    const term = tableSearch[tableKey].trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) =>
      fields.some((field) => {
        const value = typeof field === 'function' ? field(row) : row[field];
        return String(value || '').toLowerCase().includes(term);
      })
    );
  }

  function renderTableSearch(tableKey, label) {
    return (
      <label className="admin-table-search">
        <span>{label}</span>
        <input
          type="search"
          value={tableSearch[tableKey]}
          onChange={(e) =>
            setTableSearch({ ...tableSearch, [tableKey]: e.target.value })
          }
        />
      </label>
    );
  }

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

  const cleanModules = courseForm.modules
    .map((module) => module.trim())
    .filter(Boolean);

  if (!courseForm.id && cleanModules.length === 0) {
    alert('Please add at least one module before saving this course.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', courseForm.name);
    formData.append('description', courseForm.description);
    formData.append('category', courseForm.category);
    formData.append('modules', JSON.stringify(cleanModules));

    if (courseForm.image_url) {
      formData.append('image_url', courseForm.image_url);
    }

    if (courseImage) {
      formData.append('image', courseImage);
    }

    if (courseForm.id) {
      await api.put(`/courses/${courseForm.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      await api.post('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    setCourseForm({
      id: null,
      name: '',
      description: '',
      category: 'Development',
      image_url: '',
      modules: [''],
    });

    setCourseImage(null);
    setCourseModalOpen(false);
    loadCourses();
  } catch (err) {
    console.error('SAVE COURSE ERROR:', err.response?.data || err.message);
    alert(err.response?.data?.msg || err.response?.data?.error || 'Failed to save course');
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
    formData.append('file_url', materialForm.file_url);
    formData.append('content', materialForm.content);

    if (materialFile) {
      formData.append('file', materialFile);
    }

    if (materialForm.id) {
      await api.put(`/courses/materials/${materialForm.id}`, formData);
      alert('Section updated');
    } else {
      await api.post(`/courses/modules/${materialModuleId}/materials`, formData);
      alert('Section uploaded');
    }

    setMaterialForm({ id: null, title: '', type: 'section', file_url: '', content: '' });
    setMaterialFile(null);
    loadModulesForCourse(materialCourseId, true);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.msg || 'Failed to save section');
  }
}
function editMaterial(material) {
  setMaterialForm({
    id: material.id,
    title: material.title || '',
    type: material.type || 'section',
    file_url: material.file_url || '',
    content: material.content || '',
  });
}

async function deleteMaterial(id) {
  if (!window.confirm('Delete this section?')) return;

  try {
    await api.delete(`/courses/materials/${id}`);
    alert('Section deleted');
    loadModulesForCourse(materialCourseId, true);
  } catch (err) {
    console.error(err);
    alert('Failed to delete section');
  }
}

  function openCourseModal(course = null) {
  setCourseForm(
    course
      ? {
          id: course.id,
          name: course.name,
          description: course.description || '',
          category: inferCourseCategory(course),
          image_url: course.image_url || '',
          modules: [''],
        }
      : {
          id: null,
          name: '',
          description: '',
          category: 'Development',
          image_url: '',
          modules: [''],
        }
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

  function resetAssessmentForm() {
    setQuizForm({
      title: 'Section Assessment',
      questions: [
        { ...emptyAssessmentQuestion },
        { ...emptyAssessmentQuestion },
        { ...emptyAssessmentQuestion },
      ],
    });
  }

  async function loadQuizForModule(moduleId) {
    if (!moduleId) {
      resetAssessmentForm();
      return;
    }

    try {
      const { data } = await api.get(`/courses/modules/${moduleId}/quiz`);
      const questions = Array.isArray(data) ? data : [];

      if (questions.length > 0) {
        setQuizForm({
          title: questions[0]?.title || 'Section Assessment',
          questions: questions.map((question) => ({
            id: question.id,
            question: question.question || '',
            option_a: question.option_a || '',
            option_b: question.option_b || '',
            option_c: question.option_c || '',
            option_d: question.option_d || '',
            correct_option: question.correct_option || 'A',
          })),
        });
      } else {
        resetAssessmentForm();
      }
    } catch (err) {
      console.error(err);
      resetAssessmentForm();
    }
  }

  function updateAssessmentQuestion(index, field, value) {
    const updatedQuestions = quizForm.questions.map((question, questionIndex) =>
      questionIndex === index ? { ...question, [field]: value } : question
    );

    setQuizForm({ ...quizForm, questions: updatedQuestions });
  }

  function addAssessmentQuestion() {
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, { ...emptyAssessmentQuestion }],
    });
  }

  function removeAssessmentQuestion(index) {
    if (quizForm.questions.length <= 3) {
      alert('Assessment must have at least 3 questions.');
      return;
    }

    const updatedQuestions = quizForm.questions.filter((_, questionIndex) => questionIndex !== index);
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  }

  async function handleSaveQuiz(e) {
    e.preventDefault();

    if (!quizModuleId) return;

    const cleanQuestions = quizForm.questions.map((question) => ({
      question: question.question.trim(),
      option_a: question.option_a.trim(),
      option_b: question.option_b.trim(),
      option_c: question.option_c.trim(),
      option_d: question.option_d.trim(),
      correct_option: question.correct_option,
    }));

    if (cleanQuestions.length < 3) {
      alert('Assessment must have at least 3 questions.');
      return;
    }

    const hasInvalidQuestion = cleanQuestions.some(
      (question) => !question.question || !question.option_a || !question.option_b || !question.correct_option
    );

    if (hasInvalidQuestion) {
      alert('Each question must have a question, option A, option B, and correct answer.');
      return;
    }

    try {
      await api.post(`/courses/modules/${quizModuleId}/quiz`, {
        title: quizForm.title || 'Section Assessment',
        questions: cleanQuestions,
      });

      alert('Assessment saved for this section');
      loadModulesForCourse(quizCourseId);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to save assessment');
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
    const filteredCourses = filterTableRows(courses, 'courses', [
      'id',
      'name',
      'category',
      'description',
    ]);

    return (
      <div className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2 className="admin-title">Public Courses</h2>
            <p className="admin-sub">
              Manage the courses that appear on the public study page.
            </p>
          </div>
          <button type="button" className="admin-primary-btn" onClick={() => openCourseModal()}>
            Add public course
          </button>
        </div>

        <div className="admin-table-panel">
          <div className="admin-table-toolbar">
            <div className="admin-table-count">
              Showing {filteredCourses.length} of {courses.length} public courses
            </div>
            {renderTableSearch('courses', 'Search courses:')}
          </div>

          <div className="admin-table-shell">
            <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((c) => (
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
                <td>{inferCourseCategory(c)}</td>
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
                    onClick={() => {
                      setActiveTab('modules');
                      setSelectedCourseForModules(String(c.id));
                      loadModulesForCourse(c.id);
                    }}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Curriculum
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
        </div>

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
                <h3>{courseForm.id ? 'Update public course' : 'Add public course'}</h3>
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
              <label>Category</label>
              <select
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                required
              >
                {COURSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <label>Course image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCourseImage(e.target.files[0] || null)}
              />
              {courseForm.image_url && !courseImage && (
  <img className="admin-modal-preview" src={resolveImageUrl(courseForm.image_url)} alt="" />
)}

{!courseForm.id && (
  <>
    <label>Course Modules</label>

    {courseForm.modules.map((module, index) => (
      <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder={`Module ${index + 1}`}
          value={module}
          onChange={(e) => {
            const updatedModules = [...courseForm.modules];
            updatedModules[index] = e.target.value;
            setCourseForm({ ...courseForm, modules: updatedModules });
          }}
          required
        />

        {courseForm.modules.length > 1 && (
          <button
            type="button"
            onClick={() => {
              const updatedModules = courseForm.modules.filter((_, i) => i !== index);
              setCourseForm({ ...courseForm, modules: updatedModules });
            }}
          >
            X
          </button>
        )}
      </div>
    ))}

    <button
      type="button"
      onClick={() =>
        setCourseForm({
          ...courseForm,
          modules: [...courseForm.modules, ''],
        })
      }
    >
      + Add Module
    </button>
  </>
)}

<button type="submit" className="admin-primary-btn">
                {courseForm.id ? 'Update public course' : 'Add public course'}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  function renderModules() {
    const filteredModules = filterTableRows(modules, 'modules', [
      'id',
      'title',
      'materials_count',
    ]);

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

            <div className="admin-table-panel">
              <div className="admin-table-toolbar">
                <div className="admin-table-count">
                  Showing {filteredModules.length} of {modules.length} modules
                </div>
                {renderTableSearch('modules', 'Search modules:')}
              </div>

              <div className="admin-table-shell">
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
                {filteredModules.map((m) => (
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
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  function renderMaterials() {
  return (
    <div className="admin-section">
      <h2 className="admin-title">Sections, Notes & Videos</h2>

      <div className="admin-form-row">
        <select
          value={materialCourseId}
          onChange={(e) => {
            const v = e.target.value;
            setMaterialCourseId(v);
            setMaterialModuleId('');
            setMaterialForm({
              id: null,
              title: '',
              type: 'section',
              file_url: '',
              content: '',
            });
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
          onChange={(e) => {
            setMaterialModuleId(e.target.value);
            setMaterialForm({
              id: null,
              title: '',
              type: 'section',
              file_url: '',
              content: '',
            });
          }}
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
        <>
          <form className="admin-form" onSubmit={handleUploadMaterial}>
            <div className="admin-form-column admin-form-wide">
              <input
                type="text"
                placeholder="Section title"
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
  <option value="section">Section / Paragraph</option>

  <option value="video">YouTube / Video</option>

  <option value="note">File / PDF</option>
</select>
{materialForm.type === 'section' && (
  <>
    <textarea
      placeholder="Write section paragraphs here..."
      value={materialForm.content}
      onChange={(e) =>
        setMaterialForm({ ...materialForm, content: e.target.value })
      }
      required
      style={{
        minHeight: '180px',
        padding: '0.7rem',
        border: '1px solid var(--admin-line)',
        borderRadius: '0.35rem',
        fontSize: '0.9rem',
        resize: 'vertical',
      }}
    />

    <input
      type="text"
      placeholder="Optional: Paste YouTube video link for this section"
      value={materialForm.file_url}
      onChange={(e) =>
        setMaterialForm({ ...materialForm, file_url: e.target.value })
      }
    />
  </>
)}

              {(materialForm.type === 'video' || materialForm.type === 'note') && (
                <>
                  <input
                    type="text"
                    placeholder={
                      materialForm.type === 'video'
                        ? 'Paste YouTube link or video URL'
                        : 'File URL optional'
                    }
                    value={materialForm.file_url}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, file_url: e.target.value })
                    }
                  />

                  <input
                    type="file"
                    accept={
                      materialForm.type === 'video'
                        ? 'video/*'
                        : '.pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf'
                    }
                    onChange={(e) => setMaterialFile(e.target.files[0] || null)}
                  />
                </>
              )}

              <button type="submit">
                {materialForm.id ? 'Update Section' : 'Save Section'}
              </button>

              {materialForm.id && (
                <button
                  type="button"
                  onClick={() => {
                    setMaterialForm({
                      id: null,
                      title: '',
                      type: 'section',
                      file_url: '',
                      content: '',
                    });
                    setMaterialFile(null);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="admin-table-panel">
            <div className="admin-table-toolbar">
              <div className="admin-table-count">
                Existing sections/materials for this module
              </div>
            </div>

            <div className="admin-table-shell">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Content / URL</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {materialModules
                    .find((m) => String(m.id) === String(materialModuleId))
                    ?.materials?.map((material) => (
                      <tr key={material.id}>
                        <td>{material.id}</td>
                        <td>{material.title}</td>
                        <td>{material.type}</td>
                        <td>
                          {material.type === 'section'
                            ? `${(material.content || '').slice(0, 80)}...`
                            : material.file_url || '—'}
                        </td>
                        <td>
                          <button type="button" onClick={() => editMaterial(material)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMaterial(material.id)}
                            style={{ marginLeft: '0.5rem', color: '#b91c1c' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                  {!materialModules.find((m) => String(m.id) === String(materialModuleId))
                    ?.materials?.length && (
                    <tr>
                      <td colSpan="5">No section/material added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
  function renderQuizzes() {
    return (
      <div className="admin-section">
        <h2 className="admin-title">Section Assessment</h2>
        <p className="admin-sub">
          Add at least 3 questions for each section. Students must score 80% or more before moving to the next section.
        </p>

        <div className="admin-form-row" style={{ marginBottom: '1rem' }}>
          <select
            value={quizCourseId}
            onChange={(e) => {
              const v = e.target.value;
              setQuizCourseId(v);
              setQuizModuleId('');
              setQuizModules([]);
              resetAssessmentForm();

              if (v) {
                api
                  .get(`/courses/${v}/modules`)
                  .then(({ data }) => setQuizModules(data))
                  .catch(console.error);
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
            <option value="">Select section</option>
            {quizModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} {m.assessment_count >= 3 ? '✅' : '⚠️'}
              </option>
            ))}
          </select>
        </div>

        {quizModuleId && (
          <form className="admin-form" onSubmit={handleSaveQuiz}>
            <div className="admin-form-column admin-form-wide">
              <label>Assessment title</label>
              <input
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                placeholder="Example: Section Assessment"
                required
              />

              <div
                style={{
                  background: '#f8fbff',
                  border: '1px solid var(--admin-line)',
                  borderRadius: '0.45rem',
                  padding: '0.85rem',
                  color: '#334155',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                }}
              >
                Total questions: {quizForm.questions.length} — minimum required: 3 — pass mark: 80%
              </div>

              {quizForm.questions.map((question, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid var(--admin-line)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'grid',
                    gap: '0.65rem',
                    background: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      alignItems: 'center',
                    }}
                  >
                    <strong style={{ color: 'var(--admin-text)' }}>Question {index + 1}</strong>

                    {quizForm.questions.length > 3 && (
                      <button
                        type="button"
                        onClick={() => removeAssessmentQuestion(index)}
                        style={{
                          background: 'transparent',
                          color: '#b91c1c',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 800,
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <label>Question</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => updateAssessmentQuestion(index, 'question', e.target.value)}
                    placeholder="Write the question here..."
                    required
                    style={{
                      minHeight: '80px',
                      padding: '0.7rem',
                      border: '1px solid var(--admin-line)',
                      borderRadius: '0.35rem',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                    }}
                  />

                  <label>Option A</label>
                  <input
                    value={question.option_a}
                    onChange={(e) => updateAssessmentQuestion(index, 'option_a', e.target.value)}
                    required
                  />

                  <label>Option B</label>
                  <input
                    value={question.option_b}
                    onChange={(e) => updateAssessmentQuestion(index, 'option_b', e.target.value)}
                    required
                  />

                  <label>Option C</label>
                  <input
                    value={question.option_c}
                    onChange={(e) => updateAssessmentQuestion(index, 'option_c', e.target.value)}
                  />

                  <label>Option D</label>
                  <input
                    value={question.option_d}
                    onChange={(e) => updateAssessmentQuestion(index, 'option_d', e.target.value)}
                  />

                  <label>Correct answer</label>
                  <select
                    value={question.correct_option}
                    onChange={(e) => updateAssessmentQuestion(index, 'correct_option', e.target.value)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              ))}

              <button type="button" onClick={addAssessmentQuestion}>
                + Add Question
              </button>

              <button type="submit">Save Assessment</button>
            </div>
          </form>
        )}
      </div>
    );
  }

  async function loadFinalExamQuestions(courseId) {
    if (!courseId) {
      setFinalExamQuestions([{ ...emptyFinalExamQuestion }]);
      return;
    }

    try {
      const { data } = await api.get(`/final-exam/courses/${courseId}/questions`);

      if (Array.isArray(data) && data.length > 0) {
        setFinalExamQuestions(
          data.map((question) => ({
            id: question.id,
            question_type: question.question_type || 'mcq',
            question: question.question || '',
            option_a: question.option_a || '',
            option_b: question.option_b || '',
            option_c: question.option_c || '',
            option_d: question.option_d || '',
            correct_option: question.correct_option || 'A',
            marks: question.marks || 1,
          }))
        );
      } else {
        setFinalExamQuestions([{ ...emptyFinalExamQuestion }]);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to load final exam questions');
      setFinalExamQuestions([{ ...emptyFinalExamQuestion }]);
    }
  }

  function updateFinalExamQuestion(index, field, value) {
    const updatedQuestions = finalExamQuestions.map((question, questionIndex) =>
      questionIndex === index ? { ...question, [field]: value } : question
    );

    setFinalExamQuestions(updatedQuestions);
  }

  function addFinalExamQuestion() {
    setFinalExamQuestions([
      ...finalExamQuestions,
      { ...emptyFinalExamQuestion },
    ]);
  }

  function removeFinalExamQuestion(index) {
    if (finalExamQuestions.length <= 1) {
      alert('Final exam must have at least one question.');
      return;
    }

    setFinalExamQuestions(
      finalExamQuestions.filter((_, questionIndex) => questionIndex !== index)
    );
  }

  async function handleSaveFinalExam(e) {
    e.preventDefault();

    if (!finalExamCourseId) {
      alert('Please select a course first.');
      return;
    }

    const cleanQuestions = finalExamQuestions.map((question) => ({
      question_type: question.question_type || 'mcq',
      question: question.question.trim(),
      option_a: question.question_type === 'mcq' ? question.option_a.trim() : '',
      option_b: question.question_type === 'mcq' ? question.option_b.trim() : '',
      option_c: question.question_type === 'mcq' ? question.option_c.trim() : '',
      option_d: question.question_type === 'mcq' ? question.option_d.trim() : '',
      correct_option: question.question_type === 'mcq' ? question.correct_option : '',
      marks: Number(question.marks || 1),
    }));

    const hasInvalidQuestion = cleanQuestions.some((question) => {
      if (!question.question || !question.marks || question.marks < 1) return true;

      if (question.question_type === 'mcq') {
        return !question.option_a || !question.option_b || !question.correct_option;
      }

      return false;
    });

    if (hasInvalidQuestion) {
      alert('For MCQ, question, option A, option B, correct answer, and marks are required. For open questions, question and marks are required.');
      return;
    }

    try {
      await api.post(`/final-exam/courses/${finalExamCourseId}/questions`, {
        questions: cleanQuestions,
      });

      alert('Final exam saved successfully');
      loadFinalExamQuestions(finalExamCourseId);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to save final exam');
    }
  }

  async function loadFinalExamSubmissions() {
    try {
      const { data } = await api.get('/final-exam/submissions');
      setExamSubmissions(data || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to load exam submissions');
    }
  }

  async function openSubmissionReview(submissionId) {
    try {
      const { data } = await api.get(`/final-exam/submissions/${submissionId}`);
      const scores = {};

      data.answers
        ?.filter((answer) => answer.question_type === 'open')
        .forEach((answer) => {
          scores[answer.answer_id || answer.id] = answer.marks_awarded || 0;
        });

      setSelectedSubmission(data);
      setReviewScores(scores);
      setReviewComment(data.submission?.admin_comment || '');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to open submission');
    }
  }

  async function handleApproveSubmission(e) {
    e.preventDefault();

    if (!selectedSubmission?.submission?.id) return;

    try {
      const { data } = await api.post(
        `/final-exam/submissions/${selectedSubmission.submission.id}/review`,
        {
          manual_scores: reviewScores,
          admin_comment: reviewComment,
        }
      );

      alert(data?.msg || 'Review saved successfully.');
      setSelectedSubmission(null);
      setReviewScores({});
      setReviewComment('');
      loadFinalExamSubmissions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to review submission');
    }
  }

  async function handleAllowRetake(submissionId) {
    if (!window.confirm('Allow this student to retake the final exam?')) return;

    try {
      const { data } = await api.post(`/final-exam/submissions/${submissionId}/allow-retake`);
      alert(data?.msg || 'Re-exam allowed for this student.');
      loadFinalExamSubmissions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to allow re-exam');
    }
  }

  async function handleAssignCertificate(submissionId) {
    if (!window.confirm('Assign certificate to this competent student?')) return;

    try {
      const { data } = await api.post(`/final-exam/submissions/${submissionId}/assign-certificate`);
      alert(data?.msg || 'Certificate assigned successfully.');
      loadFinalExamSubmissions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to assign certificate');
    }
  }

  function renderFinalExam() {
    const filteredSubmissions = filterTableRows(examSubmissions, 'finalExam', [
      'id',
      'student_name',
      'student_email',
      'course_name',
      'status',
      'total_score',
      'certificate_code',
      (submission) => (submission.certificate_id ? 'certificate assigned' : 'no certificate'),
      (submission) => (Number(submission.retake_allowed) === 1 ? 'reexam allowed' : ''),
    ]);

    return (
      <div className="admin-stack">
        <div className="admin-section">
          <div className="admin-section-head">
            <div>
              <h2 className="admin-title">Final Exam Questions</h2>
              <p className="admin-sub">
                Set final exam questions separately from student grading. Supports MCQ and open questions.
              </p>
            </div>
          </div>

          <div className="admin-form-row" style={{ marginBottom: '1rem' }}>
            <select
              value={finalExamCourseId}
              onChange={(e) => {
                const courseId = e.target.value;
                setFinalExamCourseId(courseId);
                loadFinalExamQuestions(courseId);
              }}
            >
              <option value="">Select course to set exam</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {finalExamCourseId ? (
            <form className="admin-form" onSubmit={handleSaveFinalExam}>
              <div className="admin-form-column admin-form-wide">
                <div
                  style={{
                    background: '#f8fbff',
                    border: '1px solid var(--admin-line)',
                    borderRadius: '0.45rem',
                    padding: '0.85rem',
                    color: '#334155',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                  }}
                >
                  Final exam is taken once only. If a student fails, admin can allow re-exam from the submissions table.
                </div>

                {finalExamQuestions.map((question, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid var(--admin-line)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      display: 'grid',
                      gap: '0.65rem',
                      background: '#ffffff',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        alignItems: 'center',
                      }}
                    >
                      <strong style={{ color: 'var(--admin-text)' }}>
                        Final Exam Question {index + 1}
                      </strong>

                      {finalExamQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFinalExamQuestion(index)}
                          style={{
                            background: 'transparent',
                            color: '#b91c1c',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 800,
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <label>Question type</label>
                    <select
                      value={question.question_type}
                      onChange={(e) =>
                        updateFinalExamQuestion(index, 'question_type', e.target.value)
                      }
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="open">Open Question</option>
                    </select>

                    <label>Question</label>
                    <textarea
                      value={question.question}
                      onChange={(e) =>
                        updateFinalExamQuestion(index, 'question', e.target.value)
                      }
                      placeholder="Write the final exam question..."
                      required
                      style={{
                        minHeight: '80px',
                        padding: '0.7rem',
                        border: '1px solid var(--admin-line)',
                        borderRadius: '0.35rem',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                      }}
                    />

                    {question.question_type === 'mcq' && (
                      <>
                        <label>Option A</label>
                        <input
                          value={question.option_a}
                          onChange={(e) =>
                            updateFinalExamQuestion(index, 'option_a', e.target.value)
                          }
                          required
                        />

                        <label>Option B</label>
                        <input
                          value={question.option_b}
                          onChange={(e) =>
                            updateFinalExamQuestion(index, 'option_b', e.target.value)
                          }
                          required
                        />

                        <label>Option C</label>
                        <input
                          value={question.option_c}
                          onChange={(e) =>
                            updateFinalExamQuestion(index, 'option_c', e.target.value)
                          }
                        />

                        <label>Option D</label>
                        <input
                          value={question.option_d}
                          onChange={(e) =>
                            updateFinalExamQuestion(index, 'option_d', e.target.value)
                          }
                        />

                        <label>Correct answer</label>
                        <select
                          value={question.correct_option}
                          onChange={(e) =>
                            updateFinalExamQuestion(index, 'correct_option', e.target.value)
                          }
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </>
                    )}

                    <label>Marks</label>
                    <input
                      type="number"
                      min="1"
                      value={question.marks}
                      onChange={(e) =>
                        updateFinalExamQuestion(index, 'marks', e.target.value)
                      }
                      required
                    />
                  </div>
                ))}

                <button type="button" onClick={addFinalExamQuestion}>
                  + Add Final Exam Question
                </button>

                <button type="submit">Save Final Exam Questions</button>
              </div>
            </form>
          ) : (
            <p className="admin-sub">Select a course above to create or edit its final exam questions.</p>
          )}
        </div>

        <div className="admin-section admin-table-panel">
          <div className="admin-table-toolbar">
            <div>
              <h2 className="admin-title">Final Exam Grading & Submissions</h2>
              <p className="admin-sub" style={{ marginBottom: 0 }}>
                Review answers, allow re-exam for failed students, and assign certificates only to competent students.
              </p>
            </div>

            <div className="admin-table-tools">
              <div className="admin-table-count">
                Showing {filteredSubmissions.length} of {examSubmissions.length} submissions
              </div>
              {renderTableSearch('finalExam', 'Search submissions:')}
              <button type="button" className="admin-primary-btn" onClick={loadFinalExamSubmissions}>
                Refresh
              </button>
            </div>
          </div>

          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Auto Score</th>
                  <th>Total Score</th>
                  <th>Certificate</th>
                  <th>Re-exam</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubmissions.map((submission) => {
                  const isCompetent =
                    submission.status === 'approved' && Number(submission.total_score) >= 80;
                  const isFailed = submission.status === 'rejected';
                  const hasCertificate = Boolean(submission.certificate_id || submission.certificate_code);

                  return (
                    <tr key={submission.id}>
                      <td>{submission.id}</td>
                      <td>{submission.student_name}</td>
                      <td>{submission.student_email || '—'}</td>
                      <td>{submission.course_name}</td>
                      <td>
                        <strong
                          style={{
                            color:
                              submission.status === 'approved'
                                ? '#16a34a'
                                : submission.status === 'rejected'
                                  ? '#b91c1c'
                                  : '#d97706',
                          }}
                        >
                          {submission.status}
                        </strong>
                      </td>
                      <td>{submission.auto_score}</td>
                      <td>{submission.total_score}%</td>
                      <td>{hasCertificate ? submission.certificate_code : 'Not assigned'}</td>
                      <td>{Number(submission.retake_allowed) === 1 ? 'Allowed' : 'No'}</td>
                      <td>
                        {submission.submitted_at
                          ? new Date(submission.submitted_at).toLocaleString()
                          : '—'}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => openSubmissionReview(submission.id)}
                        >
                          Review
                        </button>

                        {isFailed && Number(submission.retake_allowed) !== 1 && (
                          <button
                            type="button"
                            onClick={() => handleAllowRetake(submission.id)}
                            style={{ marginLeft: '0.5rem', color: '#d97706' }}
                          >
                            Re-exam
                          </button>
                        )}

                        {isCompetent && !hasCertificate && (
                          <button
                            type="button"
                            onClick={() => handleAssignCertificate(submission.id)}
                            style={{ marginLeft: '0.5rem', color: '#16a34a', fontWeight: 800 }}
                          >
                            Assign Certificate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan="11">No final exam submissions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedSubmission && (
          <div
            className="admin-modal-backdrop"
            role="presentation"
            onClick={() => setSelectedSubmission(null)}
          >
            <form
              className="admin-modal"
              style={{ width: 'min(900px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleApproveSubmission}
            >
              <div className="admin-modal-head">
                <h3>Review Final Exam Submission</h3>
                <button type="button" onClick={() => setSelectedSubmission(null)}>
                  X
                </button>
              </div>

              <p className="admin-sub" style={{ marginBottom: 0 }}>
                Student: <strong>{selectedSubmission.submission.student_name}</strong> — Course:{' '}
                <strong>{selectedSubmission.submission.course_name}</strong>
              </p>

              <p className="admin-sub" style={{ marginBottom: 0 }}>
                Current status: <strong>{selectedSubmission.submission.status}</strong> — Current score:{' '}
                <strong>{selectedSubmission.submission.total_score}%</strong>
              </p>

              {selectedSubmission.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  style={{
                    border: '1px solid var(--admin-line)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'grid',
                    gap: '0.55rem',
                  }}
                >
                  <strong>
                    {index + 1}. {answer.question}
                  </strong>

                  {answer.question_type === 'mcq' ? (
                    <>
                      <p style={{ margin: 0 }}>
                        Selected: <strong>{answer.selected_option || '—'}</strong>
                      </p>
                      <p style={{ margin: 0 }}>
                        Correct: <strong>{answer.correct_option}</strong>
                      </p>
                      <p style={{ margin: 0 }}>
                        Marks awarded: <strong>{answer.marks_awarded}</strong> / {answer.marks}
                      </p>
                    </>
                  ) : (
                    <>
                      <label>Student open answer</label>
                      <textarea
                        value={answer.answer_text || ''}
                        readOnly
                        style={{
                          minHeight: '110px',
                          padding: '0.7rem',
                          border: '1px solid var(--admin-line)',
                          borderRadius: '0.35rem',
                          fontSize: '0.9rem',
                          resize: 'vertical',
                        }}
                      />

                      <label>Marks awarded / {answer.marks}</label>
                      <input
                        type="number"
                        min="0"
                        max={answer.marks}
                        value={reviewScores[answer.id] ?? 0}
                        onChange={(e) =>
                          setReviewScores({
                            ...reviewScores,
                            [answer.id]: e.target.value,
                          })
                        }
                      />
                    </>
                  )}
                </div>
              ))}

              <label>Admin comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Optional comment for student..."
                style={{
                  minHeight: '90px',
                  padding: '0.7rem',
                  border: '1px solid var(--admin-line)',
                  borderRadius: '0.35rem',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                }}
              />

              <button type="submit" className="admin-primary-btn">
                Save Review Only
              </button>

              {selectedSubmission.submission.status === 'approved' &&
                Number(selectedSubmission.submission.total_score) >= 80 &&
                !selectedSubmission.submission.certificate_id && (
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={() => handleAssignCertificate(selectedSubmission.submission.id)}
                    style={{ background: '#16a34a' }}
                  >
                    Assign Certificate
                  </button>
                )}
            </form>
          </div>
        )}
      </div>
    );
  }

  function renderStudents() {
    if (students.length === 0) {
      // load on first open
      loadStudents();
    }
    const filteredStudents = filterTableRows(students, 'students', [
      'id',
      'full_name',
      'email',
      'course_name',
      'status',
    ]);

    return (
      <div className="admin-section">
        <h2 className="admin-title">Students</h2>
        <div className="admin-table-panel">
          <div className="admin-table-toolbar">
            <div className="admin-table-count">
              Showing {filteredStudents.length} of {students.length} students
            </div>
            {renderTableSearch('students', 'Search students:')}
          </div>

          <div className="admin-table-shell">
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
            {filteredStudents.map((s) => (
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
        </div>
      </div>
    );
  }

  function renderProducts() {
    const filteredProducts = filterTableRows(products, 'products', [
      'id',
      'name',
      'price',
      'old_price',
      'discount_percent',
    ]);

    return (
      <div className="admin-stack">
        <button
          type="button"
          className="admin-add-product-btn"
          onClick={() => {
            setEditingProduct(null);
            setProductModalOpen(true);
          }}
        >
          <span aria-hidden="true">+</span>
          Add Product
        </button>

        <div className="admin-section admin-table-panel">
          <div className="admin-table-toolbar">
            <h2 className="admin-title">Products</h2>
            <div className="admin-table-tools">
              <div className="admin-table-count">
                Showing {filteredProducts.length} of {products.length} products
              </div>
              {renderTableSearch('products', 'Search products:')}
            </div>
          </div>

          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Old Price</th>
                  <th>Off</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.price}</td>
                    <td>{p.old_price || '-'}</td>
                    <td>{p.discount_percent ? `${p.discount_percent}%` : '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-action-btn edit"
                        onClick={() => {
                          setEditingProduct(p);
                          setProductModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn delete"
                        onClick={() => handleDeleteProduct(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {productModalOpen && (
          <div
            className="admin-modal-backdrop"
            role="presentation"
            onClick={() => setProductModalOpen(false)}
          >
            <div
              className="admin-modal admin-product-modal"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-head">
                <h3>{editingProduct ? 'Update product' : 'Add product'}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(false);
                  }}
                  aria-label="Close product form"
                >
                  X
                </button>
              </div>
              <ProductForm
                initial={editingProduct}
                onSuccess={() => {
                  setEditingProduct(null);
                  setProductModalOpen(false);
                  loadProducts();
                }}
              />
            </div>
          </div>
        )}
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

        .admin-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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

        .admin-table-panel {
          padding: 0;
          overflow: hidden;
        }

        .admin-table-toolbar {
          min-height: 5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 1.45rem;
          background: #ffffff;
        }

        .admin-table-toolbar .admin-title {
          margin: 0;
        }

        .admin-table-count {
          color: #475569;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .admin-table-tools {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .admin-table-search {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #000000;
          font-size: 0.95rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .admin-table-search input {
          width: min(250px, 42vw);
          height: 2.7rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.45rem;
          padding: 0.5rem 0.7rem;
          font-size: 0.95rem;
          outline: none;
        }

        .admin-table-search input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.16);
        }

        .admin-add-product-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          border: none;
          border-radius: 0.45rem;
          background: #0ea5e9;
          color: #ffffff;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 800;
          padding: 0.85rem 1.25rem;
          box-shadow: 0 0.8rem 1.6rem rgba(14, 165, 233, 0.18);
        }

        .admin-add-product-btn span {
          display: inline-grid;
          place-items: center;
          width: 1.1rem;
          height: 1.1rem;
          font-size: 1.25rem;
          line-height: 1;
        }

        .admin-table-shell {
          width: 100%;
          overflow-x: auto;
        }

        .admin-table-shell .admin-table {
          margin-top: 0;
        }

        .admin-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 1rem;
          font-size: 0.95rem;
          background: #ffffff;
        }

        .admin-table th,
        .admin-table td {
          border-bottom: 1px solid #d7dde5;
          border-right: 1px solid #d7dde5;
          padding: 0.85rem 0.95rem;
          text-align: left;
          vertical-align: middle;
        }

        .admin-table th {
          position: relative;
          background: #20262c;
          color: #ffffff;
          font-weight: 800;
          white-space: nowrap;
        }

        .admin-table th::after {
          content: '';
          position: absolute;
          right: 0.75rem;
          top: 50%;
          width: 0;
          height: 0;
          border-left: 0.32rem solid transparent;
          border-right: 0.32rem solid transparent;
          border-bottom: 0.55rem solid rgba(255, 255, 255, 0.28);
          transform: translateY(-70%);
        }

        .admin-table th:first-child {
          border-left: none;
        }

        .admin-table th:last-child,
        .admin-table td:last-child {
          border-right: none;
        }

        .admin-table tbody tr:nth-child(odd) {
          background: #f1f1f1;
        }

        .admin-table tbody tr:nth-child(even) {
          background: #ffffff;
        }

        .admin-table td button {
          cursor: pointer;
        }

        .admin-table td button:not(.admin-action-btn) {
          border: none;
          background: transparent;
          color: var(--admin-blue);
          font-size: 0.8rem;
        }

        .admin-action-btn {
          border: none;
          border-radius: 0.35rem;
          color: #0f172a;
          font-size: 0.82rem;
          font-weight: 800;
          padding: 0.48rem 0.75rem;
          margin-right: 0.35rem;
        }

        .admin-action-btn.edit {
          background: #ffc107;
        }

        .admin-action-btn.delete {
          background: #ff3f4f;
          color: #ffffff;
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

        .admin-modal input,
        .admin-modal select {
          padding: 0.65rem 0.75rem;
          border-radius: 0.35rem;
          border: 1px solid var(--admin-line);
          font-size: 0.85rem;
        }

        .admin-product-modal {
          width: min(620px, 100%);
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
        }

        .admin-product-modal form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin: 0;
        }

        .admin-product-modal input,
        .admin-product-modal textarea {
          width: 100%;
          padding: 0.72rem 0.8rem;
          border: 1px solid var(--admin-line);
          border-radius: 0.4rem;
          font: inherit;
        }

        .admin-product-modal textarea {
          min-height: 5.5rem;
          resize: vertical;
        }

        .admin-product-modal button[type='submit'] {
          align-self: flex-start;
          border: none;
          border-radius: 0.4rem;
          background: var(--admin-blue);
          color: #ffffff;
          cursor: pointer;
          font-weight: 800;
          padding: 0.7rem 1rem;
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

          .admin-table-toolbar {
            align-items: flex-start;
            flex-direction: column;
            min-height: auto;
          }

          .admin-table-tools,
          .admin-table-search {
            align-items: flex-start;
            flex-direction: column;
            width: 100%;
          }

          .admin-table-search input {
            width: 100%;
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
                  Public Courses
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
                  className={activeTab === 'finalExam' ? 'active' : ''}
                  onClick={() => {
                    setActiveTab('finalExam');
                    loadFinalExamSubmissions();
                  }}
                >
                  Final Exam
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
              {activeTab === 'courses' && 'Public Courses'}
              {activeTab === 'modules' && 'Curriculum'}
              {activeTab === 'materials' && 'Materials'}
              {activeTab === 'quizzes' && 'Assessments'}
              {activeTab === 'finalExam' && 'Final Exam & Certificates'}
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
            {activeTab === 'finalExam' && renderFinalExam()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>
    </>
  );
}
