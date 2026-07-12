'use client';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import CountryCombobox from '@/components/country-combobox';

// "선택 안 함" 체크 시 저장되는 값 — 서버가 이미 허용하는 'other'를 재사용
const PREFER_NOT_TO_SAY = 'other';

// ─── 타입 ─────────────────────────────────────────────────

export type UserInfoValues = {
  firstName: string;
  middleName: string;
  lastName: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  country: string;
  termsAgreement: boolean;
};

export type UserInfoErrors = {
  firstName?: string;
  lastName?: string;
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
  gender?: string;
  country?: string;
  phone?: string;
  termsAgreement?: string;
};

type Props = {
  values: UserInfoValues;
  errors: UserInfoErrors;
  phoneValue: string;
  // name, value 형태로 통일해서 각 페이지의 상태 업데이트 함수와 연결
  onChange: (name: string, value: string | boolean) => void;
  onPhoneChange: (val: string) => void;
};

// ─── 컴포넌트 ─────────────────────────────────────────────

export default function UserInfoFields({
  values,
  errors,
  phoneValue,
  onChange,
  onPhoneChange,
}: Props) {
  const errorBorder = 'border-red-400 focus:border-red-500';
  const normalBorder = 'border-gray-200 focus:border-gray-900';

  return (
    <>
      {/* 이름 */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Name <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <input
              name="firstName"
              value={values.firstName}
              onChange={(e) => onChange(e.target.name, e.target.value)}
              placeholder="First"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.firstName ? errorBorder : normalBorder}`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div className="flex-1">
            <input
              name="middleName"
              value={values.middleName}
              onChange={(e) => onChange(e.target.name, e.target.value)}
              placeholder="Middle (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <input
              name="lastName"
              value={values.lastName}
              onChange={(e) => onChange(e.target.name, e.target.value)}
              placeholder="Last"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.lastName ? errorBorder : normalBorder}`}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>
      </div>

      {/* 생년월일 */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <input
              name="birthYear"
              value={values.birthYear}
              onChange={(e) => onChange(e.target.name, e.target.value)}
              placeholder="Year"
              type="number"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.birthYear ? errorBorder : normalBorder}`}
            />
            {errors.birthYear && (
              <p className="text-xs text-red-500">{errors.birthYear}</p>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <input
              name="birthMonth"
              value={values.birthMonth}
              onChange={(e) => onChange(e.target.name, e.target.value)}
              placeholder="Month"
              type="number"
              min={1}
              max={12}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.birthMonth ? errorBorder : normalBorder}`}
            />
            {errors.birthMonth && (
              <p className="text-xs text-red-500">{errors.birthMonth}</p>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <input
              name="birthDay"
              value={values.birthDay}
              onChange={(e) => onChange(e.target.name, e.target.value)}
              placeholder="Day"
              type="number"
              min={1}
              max={31}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.birthDay ? errorBorder : normalBorder}`}
            />
            {errors.birthDay && (
              <p className="text-xs text-red-500">{errors.birthDay}</p>
            )}
          </div>
        </div>
      </div>

      {/* 성별 */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Gender <span className="text-gray-400 normal-case font-normal">(optional)</span>
        </label>
        <select
          name="gender"
          value={values.gender}
          onChange={(e) => onChange(e.target.name, e.target.value)}
          disabled={values.gender === PREFER_NOT_TO_SAY}
          className={`border rounded-lg px-3 py-2 text-sm outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400 ${errors.gender ? errorBorder : normalBorder}`}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            id="genderSkip"
            checked={values.gender === PREFER_NOT_TO_SAY}
            onChange={(e) => onChange('gender', e.target.checked ? PREFER_NOT_TO_SAY : '')}
            className="w-4 h-4 accent-gray-900"
          />
          <label htmlFor="genderSkip" className="text-sm text-gray-600">
            Prefer not to say
          </label>
        </div>
        {errors.gender && (
          <p className="text-xs text-red-500">{errors.gender}</p>
        )}
      </div>

      {/* 국가 (Combobox) */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Nationality <span className="text-red-500">*</span>
        </label>
        <CountryCombobox
          value={values.country}
          onChange={(code) => onChange('country', code)}
          placeholder="Select Nationality"
        />
        {errors.country && (
          <p className="text-xs text-red-500">{errors.country}</p>
        )}
      </div>

      {/* 전화번호 */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          international
          defaultCountry="US"
          value={phoneValue}
          onChange={(val) => onPhoneChange(val ?? '')}
          className={`border rounded-lg px-3 py-2 text-sm ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
        />
        {errors.phone && (
          <p className="text-xs text-red-500">{errors.phone}</p>
        )}
      </div>

      {/* 이용약관 */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={values.termsAgreement}
            onChange={(e) => onChange('termsAgreement', e.target.checked)}
            className="w-4 h-4 accent-gray-900"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{' '}
            <span className="underline cursor-pointer">Terms of Service</span>{' '}
            <span className="text-red-500">*</span>
          </label>
        </div>
        {errors.termsAgreement && (
          <p className="text-xs text-red-500">{errors.termsAgreement}</p>
        )}
      </div>
    </>
  );
}
