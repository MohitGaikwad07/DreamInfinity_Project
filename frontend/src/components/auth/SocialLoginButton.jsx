import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginWithGoogle } from '../../redux/slices/authSlice.js';

export const SocialLoginButton = ({ provider = 'Google' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockEmail, setMockEmail] = useState('nilesh@gmail.com');
  const [mockName, setMockName] = useState('Nilesh Kumar');
  const googleBtnRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) return;

    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    }

    const interval = setInterval(() => {
      if (window.google) {
        setScriptLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [googleClientId]);

  useEffect(() => {
    if (!scriptLoaded || !googleClientId || !googleBtnRef.current) return;

    try {
      /* global google */
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
        });

        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: googleBtnRef.current.offsetWidth || 340,
          text: 'continue_with',
          logo_alignment: 'left',
        });
      }
    } catch (err) {
      console.error('Error rendering Google Sign-In button:', err);
    }
  }, [scriptLoaded, googleClientId]);

  const handleGoogleResponse = async (response) => {
    try {
      const action = await dispatch(loginWithGoogle({ credential: response.credential }));
      if (loginWithGoogle.fulfilled.match(action)) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error('Google Sign-In failed.');
    }
  };

  const handleMockSubmit = async (e) => {
    e.preventDefault();
    if (!mockEmail) return;

    try {
      const action = await dispatch(
        loginWithGoogle({
          mock: {
            email: mockEmail,
            name: mockName,
          },
        })
      );
      if (loginWithGoogle.fulfilled.match(action)) {
        toast.success('Signed in with Mock Google Account.');
        setShowMockModal(false);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error('Mock Sign-In failed.');
    }
  };

  if (!googleClientId) {
    return (
      <div className="w-full text-center">
        <button
          type="button"
          onClick={() => setShowMockModal(true)}
          className="w-full flex items-center justify-center gap-3.5 rounded-xl border border-white/12 bg-white/4 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-white/8"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#fff"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#fff"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#fff"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#fff"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {showMockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#12101a] p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowMockModal(false)}
                className="absolute top-4 right-4 text-violet-300 hover:text-white"
              >
                ✕
              </button>
              <h3 className="text-lg font-bold text-violet-100 mb-2">Google Sign-in (Dev Mode)</h3>
              <p className="text-xs text-violet-200/60 mb-5 leading-relaxed">
                <code>VITE_GOOGLE_CLIENT_ID</code> is not configured in your <code>.env</code> file. You can configure it to use real Google login, or simulate it right now with any email below.
              </p>
              <form onSubmit={handleMockSubmit} className="space-y-4">
                <label className="block text-left space-y-1.5">
                  <span className="text-xs font-medium text-violet-200">Simulated Email</span>
                  <input
                    type="email"
                    value={mockEmail}
                    onChange={(e) => setMockEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                    placeholder="email@example.com"
                  />
                </label>
                <label className="block text-left space-y-1.5">
                  <span className="text-xs font-medium text-violet-200">Simulated Name</span>
                  <input
                    type="text"
                    value={mockName}
                    onChange={(e) => setMockName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                    placeholder="Full Name"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 py-3 text-sm font-bold text-white transition mt-2"
                >
                  Simulate Sign In
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={googleBtnRef} className="w-full min-h-[46px]" />
    </div>
  );
};
