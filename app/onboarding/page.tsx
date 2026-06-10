'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { parsePhoneNumber } from 'react-phone-number-input';
import UserInfoFields, {
  type UserInfoValues,
  type UserInfoErrors,
} from '@/components/user-info-fields';
import { useRouter } from 'next/navigation';

// ─── 타입 ─────────────────────────────────────────────────

type Errors = UserInfoErrors; // 공통 컴포넌트 에러 타입 그대로 사용

// ─── 페이지 ───────────────────────────────────────────────

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<UserInfoValues>({
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

  // 공통 컴포넌트에서 올라오는 변경 처리
  function handleFieldChange(name: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handlePhoneChange(val: string) {
    setPhoneValue(val);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  }

  // 유효성 검사
  function validate(): Errors {
    const e: Errors = {};
    if (!form.firstName) e.firstName = 'First name is required.';
    if (!form.lastName) e.lastName = 'Last name is required.';
    if (!form.birthYear) e.birthYear = 'Required.';
    if (!form.birthMonth) e.birthMonth = 'Required.';
    if (!form.birthDay) e.birthDay = 'Required.';
    if (!form.gender) e.gender = 'Please select a gender.';
    if (!form.country) e.country = 'Please select a country.';
    if (!phoneValue) e.phone = 'Phone number is required.';
    if (!form.termsAgreement)
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

    // 국가코드 / 전화번호 분리
    const parsed = parsePhoneNumber(phoneValue);
    const phoneCountryCode = parsed?.countryCallingCode
      ? `+${parsed.countryCallingCode}`
      : '';
    const phone = parsed?.nationalNumber ?? '';

    // API 호출
    const res = await fetch('/api/user/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, phoneCountryCode, phone }),
    });
    if (!res.ok) return;
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Complete your profile
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Please fill in your information to complete sign up.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* 이메일 (구글에서 받은 값, 읽기 전용) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={session?.user?.email ?? ''}
              readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
            />
          </div>

          {/* 공통 필드 */}
          <UserInfoFields
            values={form}
            errors={errors}
            phoneValue={phoneValue}
            onChange={handleFieldChange}
            onPhoneChange={handlePhoneChange}
          />

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold mt-2 hover:bg-gray-700 transition-colors"
          >
            Complete Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
