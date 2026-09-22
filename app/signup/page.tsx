'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { parsePhoneNumber } from 'react-phone-number-input';
import UserInfoFields, {
  type UserInfoValues,
  type UserInfoErrors,
} from '@/components/user-info-fields';
type Errors = UserInfoErrors & {
  email?: string;
  password?: string;
  passwordConfirm?: string;
};
function mapServerErrorToField(message: string): keyof Errors {
  if (message === 'Invalid email') return 'email';
  if (message.startsWith('Password must')) return 'password';
  if (message === 'Invalid birthYear') return 'birthYear';
  if (message === 'Invalid birthMonth') return 'birthMonth';
  if (message === 'Invalid birthDay') return 'birthDay';
  if (message === 'Terms agreement is required') return 'termsAgreement';
  if (message === 'Invalid gender value') return 'gender';
  if (message === 'Invalid field: firstName') return 'firstName';
  if (message === 'Invalid field: lastName') return 'lastName';
  if (message === 'Invalid field: country') return 'country';
  if (
    message === 'Invalid field: phoneCountryCode' ||
    message === 'Invalid field: phone'
  )
    return 'phone';
  return 'email';
}
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.34.07 2.27.74 3.04.8 1.15-.23 2.25-.93 3.47-.84 1.48.12 2.59.7 3.32 1.79-3.04 1.82-2.32 5.79.41 6.9-.57 1.56-1.3 3.1-2.24 4.23zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
const DRAFT_KEY = 'signup-draft';
type Draft = {
  credentials: { email: string; password: string; passwordConfirm: string };
  userInfo: UserInfoValues;
  phoneValue: string;
  verificationSent: boolean;
  emailVerified: boolean;
};
export default function SignupPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [userInfo, setUserInfo] = useState<UserInfoValues>({
    firstName: '',
    middleName: '',
    lastName: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    gender: '',
    country: '',
    termsAgreement: false,
  });
  const [phoneValue, setPhoneValue] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [code, setCode] = useState('');
  const [verifyChecking, setVerifyChecking] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft: Draft = JSON.parse(raw);
      setCredentials(draft.credentials);
      setUserInfo(draft.userInfo);
      setPhoneValue(draft.phoneValue);
      setVerificationSent(draft.verificationSent);
      setEmailVerified(draft.emailVerified);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);
  useEffect(() => {
    const draft: Draft = {
      credentials,
      userInfo,
      phoneValue,
      verificationSent,
      emailVerified,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [credentials, userInfo, phoneValue, verificationSent, emailVerified]);
  function handleCredentialChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (name === 'email' && (verificationSent || emailVerified)) {
      setVerificationSent(false);
      setEmailVerified(false);
      setVerifyError('');
      setResendMessage('');
    }
  }
  function handleFieldChange(name: string, value: string | boolean) {
    setUserInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }
  function handlePhoneChange(val: string) {
    setPhoneValue(val);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  }
  function validate(): Errors {
    const e: Errors = {};
    const PASSWORD_RULE =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!credentials.email) e.email = 'Email is required.';
    if (!credentials.password) e.password = 'Password is required.';
    else if (!PASSWORD_RULE.test(credentials.password))
      e.password =
        'Min 8 characters, with uppercase, lowercase, a number, and a special character.';
    if (credentials.password !== credentials.passwordConfirm)
      e.passwordConfirm = 'Passwords do not match.';
    if (!userInfo.firstName) e.firstName = 'First name is required.';
    if (!userInfo.lastName) e.lastName = 'Last name is required.';
    if (!userInfo.birthYear) e.birthYear = 'Required.';
    if (!userInfo.birthMonth) e.birthMonth = 'Required.';
    if (!userInfo.birthDay) e.birthDay = 'Required.';
    if (!userInfo.country) e.country = 'Please select a country.';
    if (!phoneValue) e.phone = 'Phone number is required.';
    if (!userInfo.termsAgreement)
      e.termsAgreement = 'You must agree to the Terms of Service.';
    return e;
  }
  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  async function handleSendVerification() {
    if (!isValidEmail(credentials.email)) {
      setErrors((prev) => ({ ...prev, email: 'Enter a valid email first.' }));
      return;
    }
    setSendingVerification(true);
    setVerifyError('');
    setResendMessage('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setVerifyError(
          data?.error ?? 'Failed to send verification email. Please try again.',
        );
        return;
      }
      if (verificationSent) setResendMessage('Verification email resent.');
      setVerificationSent(true);
    } finally {
      setSendingVerification(false);
    }
  }
  async function handleVerifyCode() {
    if (!code.trim()) {
      setVerifyError('Enter the code from your email.');
      return;
    }
    setVerifyChecking(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, code: code.trim() }),
      });
      const data = await res.json();
      if (!data.verified) {
        setVerifyError(
          'Incorrect or expired code. Please check your inbox (and spam folder), or resend the code.',
        );
        return;
      }
      setEmailVerified(true);
    } finally {
      setVerifyChecking(false);
    }
  }
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError('');
    if (!emailVerified) {
      setSubmitError('Please verify your email before creating an account.');
      return;
    }
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const parsed = parsePhoneNumber(phoneValue);
    const phoneCountryCode = parsed?.countryCallingCode
      ? `+${parsed.countryCallingCode}`
      : '';
    const phone = parsed?.nationalNumber ?? '';
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        ...userInfo,
        phoneCountryCode,
        phone,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      const message: string = data.message ?? 'Something went wrong.';
      const field = mapServerErrorToField(message);
      setErrors({ [field]: message });
      return;
    }
    // 서버가 계정 생성과 같은 요청 안에서 이미 로그인 세션 쿠키까지 심어주므로
    // 여기서 다시 signIn()을 호출할 필요 없음 (불필요한 추가 왕복 제거).
    localStorage.removeItem(DRAFT_KEY);
    window.location.href = '/';
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Create account
          </h1>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-1">
            Welcome to Hype Wedding & Hype Snap!
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleCredentialChange}
                disabled={emailVerified}
                placeholder="email@example.com"
                className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-500 ${errors.email ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
              />
              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={sendingVerification}
                  className="shrink-0 border border-gray-900 text-gray-900 rounded-lg px-4 text-sm font-medium whitespace-nowrap disabled:opacity-50"
                >
                  {sendingVerification
                    ? 'Sending...'
                    : verificationSent
                      ? 'Resend'
                      : 'Send Verification'}
                </button>
              )}
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
            {emailVerified ? (
              <p className="text-xs text-green-600">✓ Email verified</p>
            ) : (
              verificationSent && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    A verification code was sent to{' '}
                    <span className="font-semibold text-gray-900">
                      {credentials.email}
                    </span>
                    . Enter it below.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Didn&apos;t get it? Please check your spam folder.
                  </p>
                  {resendMessage && (
                    <p className="text-xs text-green-600 mt-1">
                      {resendMessage}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => {
                        setCode(
                          e.target.value
                            .replace(/[^a-zA-Z0-9]/g, '')
                            .toUpperCase(),
                        );
                        setVerifyError('');
                      }}
                      placeholder="A1B2C3"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-900 tracking-widest text-center uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={verifyChecking}
                      className="shrink-0 bg-gray-900 text-white rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
                    >
                      {verifyChecking ? 'Checking...' : 'Verify'}
                    </button>
                  </div>
                  {verifyError && (
                    <p className="text-xs text-red-500 mt-1">{verifyError}</p>
                  )}
                </div>
              )
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleCredentialChange}
              placeholder="••••••••"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
            />
            {errors.password ? (
              <p className="text-xs text-red-500">{errors.password}</p>
            ) : (
              <p className="text-xs text-gray-400">
                Min 8 characters, with uppercase, lowercase, a number, and a
                special character.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={credentials.passwordConfirm}
              onChange={handleCredentialChange}
              placeholder="••••••••"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.passwordConfirm ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
            />
            {errors.passwordConfirm && (
              <p className="text-xs text-red-500">{errors.passwordConfirm}</p>
            )}
          </div>

          <UserInfoFields
            values={userInfo}
            errors={errors}
            phoneValue={phoneValue}
            onChange={handleFieldChange}
            onPhoneChange={handlePhoneChange}
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">
                or sign up with email
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/onboarding' })}
              className="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>
          {submitError && (
            <p className="text-xs text-red-500 text-center -mb-2">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={!emailVerified}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold mt-2 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-gray-900 underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
