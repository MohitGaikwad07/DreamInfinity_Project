import { useState } from 'react';

export const PasswordInput = ({ label, error, className = '', ...inputProps }) => {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-violet-100">{label}</span>}
      <span className="relative block">
        <input type={visible ? 'text' : 'password'} className={`field pr-16 ${error ? 'field-error' : ''} ${className}`} {...inputProps} />
        <button type="button" onClick={() => setVisible((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-violet-300 hover:text-white">
          {visible ? 'Hide' : 'Show'}
        </button>
      </span>
      {error && <span className="block text-sm text-rose-300">{error}</span>}
    </label>
  );
};
