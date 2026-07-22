import toast from 'react-hot-toast';

export const SocialLoginButton = ({ provider = 'Google' }) => (
  <button type="button" onClick={() => toast('Social sign-in will be available soon.')} className="w-full rounded-xl border border-white/12 bg-white/4 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-white/8">
    Continue with {provider}
  </button>
);
