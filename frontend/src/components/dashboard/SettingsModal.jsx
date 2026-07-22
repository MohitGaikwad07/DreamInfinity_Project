import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiCheck, FiMoon, FiSun, FiType, FiVolume2, FiVolumeX, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { 
  toggleTheme, 
  setEditorFontSize, 
  setSoundEnabled, 
  setEmailAlerts 
} from '../../redux/slices/settingsSlice.js';

export const SettingsModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { theme, editorFontSize, soundEnabled, emailAlerts } = useSelector((state) => state.settings);

  const handleSave = () => {
    toast.success('Preferences successfully saved!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#14121f] shadow-2xl p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1 hover:bg-white/5 rounded-lg"
        >
          <FiX size={18} />
        </button>

        <p className="text-[10px] font-black uppercase tracking-wider text-violet-400">Application Preferences</p>
        <h2 className="text-xl font-bold text-white mb-6">User Settings</h2>

        <div className="space-y-6">
          {/* Theme Toggler */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div>
              <h4 className="text-sm font-semibold text-white">Application Theme</h4>
              <p className="text-xs text-gray-400">Choose between light and dark backgrounds</p>
            </div>
            <button 
              onClick={() => dispatch(toggleTheme())}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1 hover:bg-white/10 transition"
            >
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${theme === 'dark' ? 'bg-violet-600 text-white' : 'text-gray-400'}`}>
                <FiMoon /> Dark
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${theme === 'light' ? 'bg-violet-600 text-white' : 'text-gray-400'}`}>
                <FiSun /> Light
              </span>
            </button>
          </div>

          {/* Editor Font Size */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div>
              <h4 className="text-sm font-semibold text-white">Editor Font Size</h4>
              <p className="text-xs text-gray-400">Scale the code workspace font size</p>
            </div>
            <div className="flex items-center gap-3">
              <FiType className="text-gray-400 text-sm" />
              <select 
                value={editorFontSize}
                onChange={(e) => dispatch(setEditorFontSize(Number(e.target.value)))}
                className="bg-black/40 border border-white/10 rounded-lg text-xs text-white p-2 focus:border-violet-500 outline-none"
              >
                {[12, 13, 14, 15, 16, 17, 18, 19, 20].map((size) => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>
          </div>

          {/* Audio Feedback */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div>
              <h4 className="text-sm font-semibold text-white">Audio Feedback</h4>
              <p className="text-xs text-gray-400">Enable voice responses & practice sounds</p>
            </div>
            <button 
              onClick={() => dispatch(setSoundEnabled(!soundEnabled))}
              className={`rounded-xl border p-2.5 transition ${
                soundEnabled 
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
            </button>
          </div>

          {/* Email Reports */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-semibold text-white">Email Digest Alerts</h4>
              <p className="text-xs text-gray-400">Receive weekly AI summary performance updates</p>
            </div>
            <button 
              onClick={() => dispatch(setEmailAlerts(!emailAlerts))}
              className={`rounded-xl border p-2.5 transition ${
                emailAlerts 
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <FiMail size={16} />
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            <FiCheck /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
