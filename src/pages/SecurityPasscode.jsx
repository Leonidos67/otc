import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css';

const SecurityPasscode = () => {
  const [step, setStep] = useState('set'); // 'set' | 'confirm'
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [confirmDigits, setConfirmDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputsRef = useRef([]);

  const activeDigits = step === 'set' ? codeDigits : confirmDigits;
  const isFilled = activeDigits.every((d) => d && d.length === 1);

  const focusInput = (idx) => {
    const el = inputsRef.current[idx];
    if (el && typeof el.focus === 'function') el.focus();
  };

  const handleChange = (idx, value) => {
    const digit = (value || '').replace(/\D/g, '').slice(0, 1);
    const next = [...activeDigits];
    next[idx] = digit;
    if (step === 'set') setCodeDigits(next); else setConfirmDigits(next);
    if (digit && idx < 5) focusInput(idx + 1);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (activeDigits[idx]) {
        // clear current
        const next = [...activeDigits];
        next[idx] = '';
        if (step === 'set') setCodeDigits(next); else setConfirmDigits(next);
      } else if (idx > 0) {
        focusInput(idx - 1);
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0) focusInput(idx - 1);
    if (e.key === 'ArrowRight' && idx < 5) focusInput(idx + 1);
  };

  const trySaveIfConfirmed = () => {
    const code = codeDigits.join('');
    const confirm = confirmDigits.join('');
    if (code !== confirm) {
      setError('Коды не совпадают.');
      setConfirmDigits(['', '', '', '', '', '']);
      setTimeout(() => focusInput(0), 0);
      return false;
    }
    try {
      localStorage.setItem('security_passcode', code);
      alert('Код-пароль установлен.');
      window.history.back();
      return true;
    } catch (_) { return false; }
  };

  React.useEffect(() => {
    setError('');
    if (!isFilled) return;
    if (step === 'set') {
      setStep('confirm');
      setConfirmDigits(['', '', '', '', '', '']);
      setTimeout(() => focusInput(0), 0);
    } else if (step === 'confirm') {
      trySaveIfConfirmed();
    }
  }, [isFilled, step]);

  return (
    <div className="p-6 profile-page">
      <h1 className="profile-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/profile" className="back-link" aria-label="Назад в профиль">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        Установка кода-пароля
      </h1>
      <hr className="divider" style={{ marginTop: '8px' }} />

      {/* Шапка раздела удалена по требованию */}

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <div style={{ margin: 0 }}>
          <h3 className="profile-page-title" style={{ marginBottom: 8, textAlign: 'center', fontSize: '1.35rem' }}>{step === 'set' ? 'Введите код' : 'Подтвердите код'}</h3>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {activeDigits.map((val, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: 66,
                  height: 85,
                  textAlign: 'center',
                  fontSize: '1.875rem',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 8,
                }}
              />
            ))}
          </div>
          {error && <div className="error-text" style={{ marginTop: 8, textAlign: 'center' }}>{error}</div>}
          {step === 'confirm' && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10, marginTop: 12 }}>
              <button
                className="create-deal-button"
                type="button"
                onClick={() => { setStep('set'); setConfirmDigits(['', '', '', '', '', '']); setTimeout(() => focusInput(0), 0); }}
              >
                Назад
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityPasscode;


