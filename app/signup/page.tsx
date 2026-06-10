'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { parsePhoneNumber } from 'react-phone-number-input';
import UserInfoFields, {
  type UserInfoValues,
  type UserInfoErrors,
} from '@/components/user-info-fields';

// ─── 타입 ─────────────────────────────────────────────────

type Errors = UserInfoErrors & {
  email?: string;
  password?: string;
  passwordConfirm?: string;
};

// ─── 아이콘 ───────────────────────────────────────────────

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

// ─── 페이지 ───────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();

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

  function handleCredentialChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
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
    if (!credentials.email) e.email = 'Email is required.';
    if (!credentials.password) e.password = 'Password is required.';
    if (credentials.password !== credentials.passwordConfirm)
      e.passwordConfirm = 'Passwords do not match.';
    if (!userInfo.firstName) e.firstName = 'First name is required.';
    if (!userInfo.lastName) e.lastName = 'Last name is required.';
    if (!userInfo.birthYear) e.birthYear = 'Required.';
    if (!userInfo.birthMonth) e.birthMonth = 'Required.';
    if (!userInfo.birthDay) e.birthDay = 'Required.';
    if (!userInfo.gender) e.gender = 'Please select a gender.';
    if (!userInfo.country) e.country = 'Please select a country.';
    if (!phoneValue) e.phone = 'Phone number is required.';
    if (!userInfo.termsAgreement)
      e.termsAgreement = 'You must agree to the Terms of Service.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // 전화번호 파싱
    const parsed = parsePhoneNumber(phoneValue);
    const phoneCountryCode = parsed?.countryCallingCode
      ? `+${parsed.countryCallingCode}`
      : '';
    const phone = parsed?.nationalNumber ?? '';

    // 1. 계정 생성
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
      setErrors({ email: data.message });
      return;
    }

    // 2. 자동 로그인
    await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    // 3. 메인으로 이동
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-sm p-8">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Create account
          </h1>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-1">
            Welcome to Hype Wedding & Hype Snap!
          </h2>
        </div>

        {/* <p className="text-sm text-gray-400 mb-8">
          Sign up to start planning your perfect wedding.
        </p> */}

        {/* 이메일 가입 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* 이메일 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleCredentialChange}
              placeholder="email@example.com"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.email ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* 비밀번호 */}
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
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
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

          {/* 공통 필드 */}
          <UserInfoFields
            values={userInfo}
            errors={errors}
            phoneValue={phoneValue}
            onChange={handleFieldChange}
            onPhoneChange={handlePhoneChange}
          />
          {/* OAuth 버튼 */}
          <div className="flex flex-col gap-3">
            {/* 구분선 */}
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

            <button
              type="button"
              onClick={() => signIn('apple', { callbackUrl: '/onboarding' })}
              className="flex items-center justify-center gap-3 w-full bg-gray-900 rounded-xl py-3 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              <AppleIcon />
              Continue with Apple
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold mt-2 hover:bg-gray-700 transition-colors"
          >
            Create Account
          </button>
        </form>

        {/* 로그인 링크 */}
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
