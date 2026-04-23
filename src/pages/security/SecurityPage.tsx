import React, { useState } from 'react';
import {
  Shield, Lock, Smartphone, CheckCircle, XCircle,
  Eye, EyeOff, AlertTriangle, X, Check, Copy
} from 'lucide-react';

// Password strength checker
const getStrength = (pwd: string) => {
  let score = 0;
  const checks = {
    length:    pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number:    /[0-9]/.test(pwd),
    special:   /[^A-Za-z0-9]/.test(pwd),
  };
  score = Object.values(checks).filter(Boolean).length;
  const levels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-amber-400', 'bg-blue-500', 'bg-green-500'];
  const textColors = ['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-blue-600', 'text-green-600'];
  return { score, label: levels[score], color: colors[score], textColor: textColors[score], checks };
};

const BACKUP_CODES = ['7X2K-9M4N', 'P3R8-W6T1', 'H5Q2-L9B7', 'Z4Y6-C1D3', 'N8F5-A2E0', 'B9J3-R7U4'];

export const SecurityPage: React.FC = () => {
  // Password
  const [currPwd, setCurrPwd]           = useState('');
  const [newPwd, setNewPwd]             = useState('');
  const [confirmPwd, setConfirmPwd]     = useState('');
  const [showCurr, setShowCurr]         = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAStep, setTwoFAStep]       = useState<'idle'|'qr'|'otp'|'done'>('idle');
  const [otpInput, setOtpInput]         = useState(['','','','','','']);
  const [showBackup, setShowBackup]     = useState(false);

  const [toast, setToast]               = useState('');
  const [toastType, setToastType]       = useState<'success'|'error'>('success');

  const strength = getStrength(newPwd);

  const showToastMsg = (msg: string, type: 'success'|'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const handlePasswordUpdate = () => {
    if (!currPwd || !newPwd || !confirmPwd) { showToastMsg('Please fill in all fields.', 'error'); return; }
    if (strength.score < 3) { showToastMsg('Password is too weak. Please choose a stronger password.', 'error'); return; }
    if (newPwd !== confirmPwd) { showToastMsg('Passwords do not match!', 'error'); return; }
    showToastMsg('Password updated successfully!');
    setCurrPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpInput];
    next[i] = val;
    setOtpInput(next);
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i+1}`);
      el?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const code = otpInput.join('');
    if (code.length < 6) { showToastMsg('Please enter the 6-digit code.', 'error'); return; }
    setTwoFAEnabled(true);
    setTwoFAStep('done');
    showToastMsg('2FA enabled successfully!');
  };

  const handleDisable2FA = () => {
    setTwoFAEnabled(false);
    setTwoFAStep('idle');
    setOtpInput(['','','','','','']);
    showToastMsg('2FA disabled.');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 text-white ${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toastType === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />} {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account security settings</p>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <Lock size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-500">Choose a strong, unique password</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurr ? 'text' : 'password'} value={currPwd}
                onChange={e => setCurrPwd(e.target.value)}
                placeholder="Enter current password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => setShowCurr(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurr ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'} value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Strength meter */}
            {newPwd && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : 'bg-gray-200'}`} />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</span>
                  <span className="text-xs text-gray-400">{strength.score}/5</span>
                </div>
                {/* Checklist */}
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {[
                    { key: 'length',    label: 'At least 8 characters' },
                    { key: 'uppercase', label: 'Uppercase letter' },
                    { key: 'lowercase', label: 'Lowercase letter' },
                    { key: 'number',    label: 'Number' },
                    { key: 'special',   label: 'Special character' },
                  ].map(c => (
                    <div key={c.key} className={`flex items-center gap-1.5 text-xs ${strength.checks[c.key as keyof typeof strength.checks] ? 'text-green-600' : 'text-gray-400'}`}>
                      {strength.checks[c.key as keyof typeof strength.checks] ? <Check size={12} /> : <X size={12} />}
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'} value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${confirmPwd && newPwd !== confirmPwd ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              <button onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {confirmPwd && newPwd !== confirmPwd && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={11} /> Passwords do not match</p>
            )}
          </div>

          <button onClick={handlePasswordUpdate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            Update Password
          </button>
        </div>
      </div>

      {/* 2FA Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
            <Smartphone size={18} className="text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Two-Factor Authentication (2FA)</h2>
            <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${twoFAEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {twoFAEnabled ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
        </div>

        {/* Step: idle */}
        {twoFAStep === 'idle' && !twoFAEnabled && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">2FA is not enabled. We strongly recommend enabling it to protect your account.</p>
            </div>
            <button onClick={() => setTwoFAStep('qr')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Shield size={16} /> Enable 2FA
            </button>
          </div>
        )}

        {/* Step: QR code */}
        {twoFAStep === 'qr' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <strong>Step 1:</strong> Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </div>
            {/* Mock QR */}
            <div className="flex justify-center">
              <div className="w-44 h-44 bg-gray-900 rounded-xl flex items-center justify-center p-3">
                <div className="w-full h-full grid grid-cols-7 grid-rows-7 gap-0.5">
                  {Array(49).fill(0).map((_, i) => (
                    <div key={i} className={`rounded-sm ${[0,1,2,3,4,5,6,7,13,14,20,21,27,28,29,30,31,32,33,34,35,41,42,43,44,45,46,47,48].includes(i) || Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-mono text-gray-700">JBSWY3DPEHPK3PXP</span>
              <button onClick={() => showToastMsg('Secret key copied!')} className="text-blue-600 hover:text-blue-700">
                <Copy size={16} />
              </button>
            </div>
            <button onClick={() => setTwoFAStep('otp')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium">
              I've scanned it → Enter OTP
            </button>
          </div>
        )}

        {/* Step: OTP input */}
        {twoFAStep === 'otp' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <strong>Step 2:</strong> Enter the 6-digit code from your authenticator app to verify.
            </div>
            <div className="flex gap-2 justify-center">
              {otpInput.map((v, i) => (
                <input
                  key={i} id={`otp-${i}`} type="text" maxLength={1} value={v}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTwoFAStep('qr')}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                Back
              </button>
              <button onClick={handleVerifyOtp}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium">
                Verify & Enable
              </button>
            </div>
          </div>
        )}

        {/* Step: done / enabled */}
        {(twoFAStep === 'done' || twoFAEnabled) && twoFAStep !== 'idle' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-sm text-green-800 font-medium">2FA is active. Your account is protected.</p>
            </div>
            <button onClick={() => setShowBackup(s => !s)}
              className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {showBackup ? 'Hide' : 'View'} Backup Codes
            </button>
            {showBackup && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-3">Save these codes in a safe place. Each can be used once.</p>
                <div className="grid grid-cols-3 gap-2">
                  {BACKUP_CODES.map(code => (
                    <span key={code} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-700 text-center">{code}</span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={handleDisable2FA}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Disable 2FA
            </button>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-blue-600" /> Security Tips
        </h2>
        <div className="space-y-3">
          {[
            'Use a unique password you don\'t use elsewhere.',
            'Enable 2FA for maximum account security.',
            'Never share your login credentials with anyone.',
            'Log out from shared or public devices.',
            'Review your active sessions regularly.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};