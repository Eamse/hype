'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { parsePhoneNumber } from 'react-phone-number-input';
import UserInfoFields, { type UserInfoValues, type UserInfoErrors, } from '@/components/user-info-fields';
import { useRouter } from 'next/navigation';
type Errors = UserInfoErrors;
export default function OnboardingPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const alreadyAlertedRef = useRef(false);
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.isOnboarded && !alreadyAlertedRef.current) {
            alreadyAlertedRef.current = true;
            alert('You are already a registered member.');
            router.replace('/');
        }
    }, [status, session, router]);
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
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    function handleFieldChange(name: string, value: string | boolean) {
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof Errors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }
    function handlePhoneChange(val: string) {
        setPhoneValue(val);
        if (errors.phone)
            setErrors((prev) => ({ ...prev, phone: undefined }));
    }
    function validate(): Errors {
        const e: Errors = {};
        if (!form.firstName)
            e.firstName = 'First name is required.';
        if (!form.lastName)
            e.lastName = 'Last name is required.';
        if (!form.birthYear)
            e.birthYear = 'Required.';
        if (!form.birthMonth)
            e.birthMonth = 'Required.';
        if (!form.birthDay)
            e.birthDay = 'Required.';
        if (!form.country)
            e.country = 'Please select a country.';
        if (!phoneValue)
            e.phone = 'Phone number is required.';
        if (!form.termsAgreement)
            e.termsAgreement = 'You must agree to the Terms of Service.';
        return e;
    }
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (submitting)
            return;
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setSubmitError('');
        setSubmitting(true);
        const parsed = parsePhoneNumber(phoneValue);
        const phoneCountryCode = parsed?.countryCallingCode
            ? `+${parsed.countryCallingCode}`
            : '';
        const phone = parsed?.nationalNumber ?? '';
        try {
            const res = await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, phoneCountryCode, phone }),
            });
            if (!res.ok) {
                if (res.status === 401) {
                    setSubmitError('Your session has expired. Please sign in again.');
                }
                else {
                    const data = await res.json().catch(() => null);
                    setSubmitError(data?.message ?? 'Something went wrong. Please try again.');
                }
                setSubmitting(false);
                return;
            }
            await update();
            router.push('/');
        }
        catch {
            setSubmitError('Network error. Please check your connection and try again.');
            setSubmitting(false);
        }
    }
    if (status === 'authenticated' && session?.user?.isOnboarded) {
        return null;
    }
    return (<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Complete your profile
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Please fill in your information to complete sign up.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Email
            </label>
            <input type="email" value={session?.user?.email ?? ''} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed outline-none"/>
          </div>

          
          <UserInfoFields values={form} errors={errors} phoneValue={phoneValue} onChange={handleFieldChange} onPhoneChange={handlePhoneChange}/>

          {submitError && (<p className="text-sm text-red-500">{submitError}</p>)}

          <button type="submit" disabled={submitting} className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold mt-2 hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Submitting...' : 'Complete Sign Up'}
          </button>
        </form>
      </div>
    </div>);
}
