import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    try {
      const token = localStorage.getItem('studentToken');

      const { data } = await api.get('/final-exam/certificates/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCertificates(data || []);
    } catch (err) {
      setMessage(err?.response?.data?.msg || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }

  function certificateUrl(code) {
    return `${window.location.origin}/certificate/${code}`;
  }

  function downloadCertificate(cert) {
    window.print();
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '2rem',
        color: '#102034',
      }}
    >
      <h1 style={{ color: '#003366', marginBottom: '0.5rem' }}>
        My Certificates
      </h1>

      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Certificates approved by Stekora Tech Academy will appear here.
      </p>

      {loading && <p>Loading certificates...</p>}

      {message && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1rem',
          }}
        >
          {message}
        </div>
      )}

      {!loading && certificates.length === 0 && (
        <div
          style={{
            background: '#ffffff',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid #dbe3ef',
          }}
        >
          No certificate available yet.
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {certificates.map((cert) => (
          <div
            key={cert.id}
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #dbe3ef',
              padding: '1.5rem',
              boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
            }}
          >
            <div
              className="certificate-template"
              style={{
                border: '8px solid #003366',
                padding: '2rem',
                textAlign: 'center',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
              }}
            >
              <h2
                style={{
                  color: '#003366',
                  fontSize: '2rem',
                  margin: 0,
                  letterSpacing: '1px',
                }}
              >
                CERTIFICATE OF COMPLETION
              </h2>

              <p style={{ marginTop: '1.5rem', color: '#64748b' }}>
                This certificate is proudly presented to
              </p>

              <h1
                style={{
                  color: '#111827',
                  fontSize: '2.3rem',
                  margin: '0.5rem 0',
                  textTransform: 'uppercase',
                }}
              >
                {cert.student_name}
              </h1>

              <p style={{ color: '#64748b' }}>
                for successfully completing the course
              </p>

              <h3
                style={{
                  color: '#003366',
                  fontSize: '1.5rem',
                  marginTop: '0.4rem',
                }}
              >
                {cert.course_name}
              </h3>

              <p style={{ marginTop: '1.5rem', color: '#334155' }}>
                Issued by <strong>Stekora Tech Academy</strong>
              </p>

              <p style={{ color: '#64748b' }}>
                Issued Date:{' '}
                {new Date(cert.issued_at).toLocaleDateString()}
              </p>

              <p
                style={{
                  marginTop: '1rem',
                  fontWeight: '800',
                  color: cert.status === 'verified' ? '#16a34a' : '#dc2626',
                }}
              >
                Status: {cert.status}
              </p>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#64748b',
                  marginTop: '1rem',
                }}
              >
                Certificate Code: {cert.certificate_code}
              </p>

              <div style={{ marginTop: '1.5rem' }}>
                <img
                  alt="Certificate QR Code"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    certificateUrl(cert.certificate_code)
                  )}`}
                />
              </div>

              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Scan QR code to verify certificate authenticity.
              </p>
            </div>

            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <a
                href={certificateUrl(cert.certificate_code)}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#003366',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '800',
                }}
              >
                Verify Certificate
              </a>

              <button
                type="button"
                onClick={() => downloadCertificate(cert)}
                style={{
                  background: '#22c55e',
                  color: '#001f3f',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontWeight: '900',
                  cursor: 'pointer',
                }}
              >
                Download / Print
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}