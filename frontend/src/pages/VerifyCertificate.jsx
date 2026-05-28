import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function VerifyCertificate() {
  const { code } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { certificateCode } = useParams();

const { data } = await api.get(
  `/final-exam/certificates/verify/${certificateCode}`
);

  useEffect(() => {
    verifyCertificate();
  }, []);

  async function verifyCertificate() {
    try {
      const { data } = await api.get(
        `/final-exam/certificate/verify/${code}`
      );

      setCertificate(data);
    } catch (err) {
      setMessage(
        err?.response?.data?.msg || 'Certificate not found or invalid'
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.2rem',
          color: '#003366',
        }}
      >
        Verifying certificate...
      </div>
    );
  }

  if (message) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f8fafc',
          padding: '2rem',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #fecaca',
            borderRadius: '14px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <h2 style={{ color: '#dc2626' }}>Certificate Verification Failed</h2>

          <p style={{ color: '#64748b' }}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#eef4ff',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}
      >
        {/* TOP STATUS */}
        <div
          style={{
            background:
              certificate.status === 'verified'
                ? '#16a34a'
                : '#dc2626',
            color: '#fff',
            padding: '1rem',
            textAlign: 'center',
            fontWeight: '900',
            letterSpacing: '1px',
          }}
        >
          {certificate.status === 'verified'
            ? 'VERIFIED CERTIFICATE'
            : 'UNVERIFIED CERTIFICATE'}
        </div>

        {/* CERTIFICATE */}
        <div
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            border: '10px solid #003366',
            margin: '2rem',
            borderRadius: '18px',
            background:
              'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
          }}
        >
          <h1
            style={{
              fontSize: '2.8rem',
              color: '#003366',
              marginBottom: '1rem',
            }}
          >
            CERTIFICATE OF COMPLETION
          </h1>

          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            This certificate is proudly awarded to
          </p>

          <h2
            style={{
              fontSize: '2.5rem',
              color: '#111827',
              margin: '1rem 0',
              textTransform: 'uppercase',
            }}
          >
            {certificate.student_name}
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#64748b',
            }}
          >
            for successfully completing
          </p>

          <h3
            style={{
              fontSize: '1.8rem',
              color: '#003366',
              marginTop: '0.7rem',
            }}
          >
            {certificate.course_name}
          </h3>

          <div
            style={{
              marginTop: '2rem',
              display: 'grid',
              gap: '0.8rem',
            }}
          >
            <p>
              <strong>Issued By:</strong> Stekora Tech Academy
            </p>

            <p>
              <strong>Certificate Code:</strong>{' '}
              {certificate.certificate_code}
            </p>

            <p>
              <strong>Issue Date:</strong>{' '}
              {new Date(certificate.issued_at).toLocaleDateString()}
            </p>

            <p>
              <strong>Status:</strong>{' '}
              <span
                style={{
                  color:
                    certificate.status === 'verified'
                      ? '#16a34a'
                      : '#dc2626',
                  fontWeight: '900',
                }}
              >
                {certificate.status}
              </span>
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${window.location.href}`}
              alt="QR Code"
            />
          </div>

          <p
            style={{
              marginTop: '1rem',
              color: '#64748b',
              fontSize: '0.9rem',
            }}
          >
            This certificate can be verified online through QR scanning.
          </p>
        </div>
      </div>
    </div>
  );
}