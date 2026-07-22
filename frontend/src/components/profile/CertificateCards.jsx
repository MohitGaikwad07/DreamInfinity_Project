import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiPlus, FiTrash2, FiAward, FiBook, FiCheckCircle } from 'react-icons/fi';
import { createUserCertificate, deleteUserCertificate } from '../../redux/slices/profileSlice.js';
import toast from 'react-hot-toast';

export const CertificateCards = ({ certificates = [], isPublic = false }) => {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [type, setType] = useState('certificate');

  const openModal = () => {
    setTitle('');
    setIssuer('');
    setIssueDate('');
    setCredentialId('');
    setCredentialUrl('');
    setType('certificate');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { title, issuer, issueDate: issueDate ? new Date(issueDate) : undefined, credentialId, credentialUrl, type };
      await dispatch(createUserCertificate(payload));
      toast.success('Certificate added successfully!');
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to add certificate.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await dispatch(deleteUserCertificate(id));
        toast.success('Certificate removed successfully!');
      } catch (err) {
        toast.error('Failed to remove certificate.');
      }
    }
  };

  const getTypeIcon = (cType) => {
    switch (cType) {
      case 'course': return <FiBook className="text-violet-300 text-base" />;
      case 'achievement':
      case 'badge':
      default:
        return <FiAward className="text-violet-300 text-base" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-violet-100">Certificates & Achievements</h2>
          <p className="text-xs text-violet-100/50 mt-0.5">Certifications, course logs, and earned awards.</p>
        </div>
        {!isPublic && (
          <button 
            onClick={openModal} 
            className="secondary-button !py-1.5 !px-3 !text-xs flex items-center gap-1.5 no-print"
          >
            <FiPlus /> Add Credential
          </button>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center text-violet-100/40 text-xs">
          No certificates loaded. Add achievements to qualify your profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div key={cert._id} className="glass-card rounded-3xl p-4 hover-action-card flex items-start gap-3.5 justify-between">
              <div className="flex items-start gap-3">
                <span className="p-2.5 bg-violet-600/10 rounded-xl flex items-center justify-center mt-0.5">
                  {getTypeIcon(cert.type)}
                </span>
                
                <div>
                  <h3 className="text-xs md:text-sm font-extrabold text-violet-100 leading-tight">{cert.title}</h3>
                  <p className="text-xs text-violet-100/60 mt-1 font-semibold">{cert.issuer}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-violet-100/40 font-bold">
                    {cert.issueDate && (
                      <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                    )}
                    {cert.credentialId && (
                      <span className="border-l border-white/10 pl-2">ID: {cert.credentialId}</span>
                    )}
                  </div>

                  {cert.credentialUrl && (
                    <a 
                      href={cert.credentialUrl.startsWith('http') ? cert.credentialUrl : `https://${cert.credentialUrl}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-violet-400 hover:text-violet-300 font-bold mt-2.5 inline-block"
                    >
                      View Credential &rarr;
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between h-full gap-4">
                {/* Verification badge */}
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  <FiCheckCircle /> Verified
                </span>

                {!isPublic && (
                  <button 
                    onClick={() => handleDelete(cert._id)} 
                    className="card-actions text-rose-400 hover:text-rose-300 p-1 text-xs no-print"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="community-modal no-print">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-violet-100">Add Certificate / Achievement</h2>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Title / Course Name
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. AWS Solutions Architect Associate" 
                  className="field mt-1" 
                  required 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Issuing Organization
                <input 
                  type="text" 
                  value={issuer} 
                  onChange={(e) => setIssuer(e.target.value)} 
                  placeholder="e.g. Amazon Web Services" 
                  className="field mt-1" 
                  required 
                />
              </label>
            </div>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Issue Date
                <input 
                  type="date" 
                  value={issueDate} 
                  onChange={(e) => setIssueDate(e.target.value)} 
                  className="field mt-1 bg-neutral-900" 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Credential Type
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)} 
                  className="field mt-1 bg-neutral-900"
                >
                  <option value="certificate">Certification</option>
                  <option value="course">Course Completion</option>
                  <option value="achievement">Achievement Award</option>
                  <option value="badge">Badge</option>
                </select>
              </label>
            </div>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Credential ID (optional)
                <input 
                  type="text" 
                  value={credentialId} 
                  onChange={(e) => setCredentialId(e.target.value)} 
                  placeholder="e.g. AWS-12938ADF" 
                  className="field mt-1" 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Verification Link URL
                <input 
                  type="url" 
                  value={credentialUrl} 
                  onChange={(e) => setCredentialUrl(e.target.value)} 
                  placeholder="https://credly.com/certs/..." 
                  className="field mt-1" 
                />
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="secondary-button !py-2 !px-4 !text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="primary-button !w-auto !py-2 !px-5 !text-xs"
              >
                Upload & Verify
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
