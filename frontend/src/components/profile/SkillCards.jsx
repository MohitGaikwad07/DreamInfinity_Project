import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiPlus, FiTrash2, FiAward } from 'react-icons/fi';
import { updateProfileDetails } from '../../redux/slices/profileSlice.js';
import toast from 'react-hot-toast';

export const SkillCards = ({ skills = {}, isPublic = false }) => {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('programmingLanguages');
  const [level, setLevel] = useState('intermediate');
  const [experienceYears, setExperienceYears] = useState(1);

  // Skill category mapping
  const categoryLabels = {
    programmingLanguages: 'Programming Languages',
    frameworks: 'Frameworks & Libraries',
    databases: 'Databases',
    cloud: 'Cloud Systems',
    devOps: 'DevOps & CI/CD',
    aiMl: 'AI / Machine Learning',
    tools: 'Tools & Platforms',
    softSkills: 'Soft Skills'
  };

  const getSkillsList = (catKey) => {
    return skills?.[catKey] || [];
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const currentCategorySkills = skills?.[category] || [];
      // Prevent duplicates
      if (currentCategorySkills.some(s => s.name.toLowerCase() === name.trim().toLowerCase())) {
        toast.error('Skill already exists in this category.');
        return;
      }

      const newSkill = {
        name: name.trim(),
        level,
        experienceYears: Number(experienceYears),
        verifiedLevel: 'none' // default
      };

      const updatedSkills = {
        ...skills,
        [category]: [...currentCategorySkills, newSkill]
      };

      const result = await dispatch(updateProfileDetails({ skills: updatedSkills }));
      if (updateProfileDetails.fulfilled.match(result)) {
        toast.success('Skill added successfully!');
        setName('');
        setModalOpen(false);
      } else {
        toast.error('Failed to add skill.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  const handleDeleteSkill = async (catKey, index) => {
    if (window.confirm('Are you sure you want to remove this skill?')) {
      try {
        const currentCategorySkills = [...(skills?.[catKey] || [])];
        currentCategorySkills.splice(index, 1);

        const updatedSkills = {
          ...skills,
          [catKey]: currentCategorySkills
        };

        const result = await dispatch(updateProfileDetails({ skills: updatedSkills }));
        if (updateProfileDetails.fulfilled.match(result)) {
          toast.success('Skill removed.');
        } else {
          toast.error('Failed to remove skill.');
        }
      } catch (err) {
        toast.error('An error occurred.');
      }
    }
  };

  const getVerifiedBadgeColor = (vLevel) => {
    switch (vLevel) {
      case 'gold': return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
      case 'silver': return 'bg-neutral-300/20 text-neutral-200 border-neutral-300/30';
      case 'bronze': return 'bg-orange-400/20 text-orange-300 border-orange-400/30';
      default: return null;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-violet-100">Professional Skills</h2>
          <p className="text-xs text-violet-100/50 mt-0.5">Categorized knowledge, experience metrics, and verification status.</p>
        </div>
        {!isPublic && (
          <button 
            onClick={() => setModalOpen(true)} 
            className="secondary-button !py-1.5 !px-3 !text-xs flex items-center gap-1.5 no-print"
          >
            <FiPlus /> Add Skill
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(categoryLabels).map(([catKey, catLabel]) => {
          const list = getSkillsList(catKey);
          if (list.length === 0 && isPublic) return null;

          return (
            <div key={catKey} className="glass-card rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-extrabold text-violet-300 uppercase tracking-wider border-b border-white/5 pb-2">
                {catLabel}
              </h3>

              {list.length === 0 ? (
                <p className="text-[11px] text-violet-100/30 italic">No skills listed in this category.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {list.map((skill, index) => (
                    <div 
                      key={`${skill.name}-${index}`}
                      className="group flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-violet-600/30 rounded-xl px-2.5 py-1 text-xs text-violet-100 transition-all duration-200"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{skill.name}</span>
                        <span className="text-[9px] text-violet-100/40 capitalize font-medium">
                          {skill.level} &bull; {skill.experienceYears}y
                        </span>
                      </div>
                      
                      {/* Verified Badge */}
                      {skill.verifiedLevel && skill.verifiedLevel !== 'none' && (
                        <span className={`px-1.5 py-0.5 rounded border text-[8px] font-extrabold uppercase flex items-center gap-0.5 ${getVerifiedBadgeColor(skill.verifiedLevel)}`}>
                          <FiAward /> {skill.verifiedLevel}
                        </span>
                      )}

                      {!isPublic && (
                        <button 
                          onClick={() => handleDeleteSkill(catKey, index)}
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-all ml-1.5 text-[10px] no-print"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="community-modal no-print">
          <form onSubmit={handleAddSkill} className="space-y-4">
            <h2 className="text-lg font-bold text-violet-100">Add Professional Skill</h2>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Skill Name
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Node.js, Kubernetes, Git" 
                  className="field mt-1" 
                  required 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Skill Category
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="field mt-1 bg-neutral-900"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Skill Level
                <select 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value)} 
                  className="field mt-1 bg-neutral-900"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </label>

              <label className="block text-xs text-violet-100/70">
                Years of Experience
                <input 
                  type="number" 
                  min="0" 
                  max="50"
                  value={experienceYears} 
                  onChange={(e) => setExperienceYears(e.target.value)} 
                  className="field mt-1" 
                  required 
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
                Add to Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
