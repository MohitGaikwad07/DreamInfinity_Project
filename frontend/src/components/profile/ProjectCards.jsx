import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiPlus, FiEdit2, FiTrash2, FiGithub, FiExternalLink, FiVideo, FiImage } from 'react-icons/fi';
import { createUserProject, updateUserProject, deleteUserProject } from '../../redux/slices/profileSlice.js';
import toast from 'react-hot-toast';

export const ProjectCards = ({ projects = [], isPublic = false }) => {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStackStr, setTechStackStr] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [liveDemo, setLiveDemo] = useState('');
  const [screenshotsStr, setScreenshotsStr] = useState('');
  const [videoDemo, setVideoDemo] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setTechStackStr('');
    setGithubLink('');
    setLiveDemo('');
    setScreenshotsStr('');
    setVideoDemo('');
    setModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingId(proj._id);
    setTitle(proj.title);
    setDescription(proj.description || '');
    setTechStackStr(proj.techStack?.join(', ') || '');
    setGithubLink(proj.githubLink || '');
    setLiveDemo(proj.liveDemo || '');
    setScreenshotsStr(proj.screenshots?.join(', ') || '');
    setVideoDemo(proj.videoDemo || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const techStack = techStackStr.split(',').map(s => s.trim()).filter(Boolean);
    const screenshots = screenshotsStr.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { title, description, techStack, githubLink, liveDemo, screenshots, videoDemo };

    try {
      if (editingId) {
        await dispatch(updateUserProject({ id: editingId, payload }));
        toast.success('Project updated successfully!');
      } else {
        await dispatch(createUserProject(payload));
        toast.success('Project added successfully!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await dispatch(deleteUserProject(id));
        toast.success('Project removed successfully!');
      } catch (err) {
        toast.error('Failed to remove project.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-violet-100">Featured Projects</h2>
          <p className="text-xs text-violet-100/50 mt-0.5">Showcase your technical competence with repositories and links.</p>
        </div>
        {!isPublic && (
          <button 
            onClick={openAddModal} 
            className="secondary-button !py-1.5 !px-3 !text-xs flex items-center gap-1.5 no-print"
          >
            <FiPlus /> Add Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center text-violet-100/40 text-xs">
          No projects added yet. Click Add Project to showcase your builds.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div key={proj._id} className="glass-card rounded-3xl p-5 hover-action-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm md:text-base font-extrabold text-violet-100 truncate">{proj.title}</h3>
                  
                  {/* Action items */}
                  {!isPublic && (
                    <div className="card-actions no-print">
                      <button 
                        onClick={() => openEditModal(proj)} 
                        className="text-violet-300 hover:text-white p-1 text-xs"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => handleDelete(proj._id)} 
                        className="text-rose-400 hover:text-rose-300 p-1 text-xs"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-violet-100/70 mt-2 line-clamp-3 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>

                {/* Tech tags */}
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {proj.techStack.map((tech) => (
                      <span key={tech} className="text-[10px] font-bold px-2 py-0.5 bg-violet-600/10 border border-violet-600/20 text-violet-300 rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Media indicators */}
                <div className="flex gap-2 mt-4 text-[10px] text-violet-100/50">
                  {proj.screenshots && proj.screenshots.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FiImage /> {proj.screenshots.length} Screenshot{proj.screenshots.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {proj.videoDemo && (
                    <span className="flex items-center gap-1">
                      <FiVideo /> Demo Available
                    </span>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center gap-4 mt-5 pt-3 border-t border-white/5 text-xs font-bold">
                {proj.githubLink && (
                  <a href={proj.githubLink.startsWith('http') ? proj.githubLink : `https://${proj.githubLink}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-violet-300 hover:text-white transition">
                    <FiGithub /> GitHub Code
                  </a>
                )}
                {proj.liveDemo && (
                  <a href={proj.liveDemo.startsWith('http') ? proj.liveDemo : `https://${proj.liveDemo}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-violet-300 hover:text-white transition">
                    <FiExternalLink /> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="community-modal no-print">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-violet-100">{editingId ? 'Edit Project' : 'Add Feature Project'}</h2>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Project Title
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Dream & Infinity Core Platform" 
                  className="field mt-1" 
                  required 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Tech Stack (Comma-separated)
                <input 
                  type="text" 
                  value={techStackStr} 
                  onChange={(e) => setTechStackStr(e.target.value)} 
                  placeholder="React, Node.js, Redux, Tailwind" 
                  className="field mt-1" 
                />
              </label>
            </div>

            <label className="block text-xs text-violet-100/70">
              Project Description
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Give a brief summary of what challenges this project solves, how you built it, etc." 
                className="field mt-1 h-20" 
              />
            </label>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                GitHub Repository Link
                <input 
                  type="text" 
                  value={githubLink} 
                  onChange={(e) => setGithubLink(e.target.value)} 
                  placeholder="github.com/mohit/dream-infinity" 
                  className="field mt-1" 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Live Demo Link
                <input 
                  type="text" 
                  value={liveDemo} 
                  onChange={(e) => setLiveDemo(e.target.value)} 
                  placeholder="dreaminfinity.com/demo" 
                  className="field mt-1" 
                />
              </label>
            </div>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Screenshot Links (Comma-separated URLs)
                <input 
                  type="text" 
                  value={screenshotsStr} 
                  onChange={(e) => setScreenshotsStr(e.target.value)} 
                  placeholder="https://example.com/ss1.jpg, https://example.com/ss2.jpg" 
                  className="field mt-1" 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Video Demo URL
                <input 
                  type="text" 
                  value={videoDemo} 
                  onChange={(e) => setVideoDemo(e.target.value)} 
                  placeholder="https://youtube.com/watch?v=123" 
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
                {editingId ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
