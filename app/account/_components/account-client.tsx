'use client';
import { useEffect, useState } from 'react';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import { getData } from 'country-list';
import { signOut } from 'next-auth/react';
type UserData = {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    gender: string;
    country: string;
    phoneCountryCode: string;
    phone: string;
    birthYear: string;
    birthMonth: string;
    birthDay: string;
    hasPassword: boolean;
};
const EMPTY_USER: UserData = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    gender: '',
    country: '',
    phoneCountryCode: '',
    phone: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    hasPassword: false,
};
const COUNTRIES = getData();
const CALLING_CODES = getCountries()
    .map((c) => ({ country: c, code: `+${getCountryCallingCode(c)}` }))
    .sort((a, b) => a.code.localeCompare(b.code));
function countryName(isoCode: string) {
    return COUNTRIES.find((c) => c.code === isoCode)?.name ?? isoCode;
}
function formatBirthday(year: string, month: string, day: string) {
    if (!year || !month || !day)
        return '—';
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
const YEARS = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
export default function AccountClient() {
    const [user, setUser] = useState<UserData>(EMPTY_USER);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<UserData>(EMPTY_USER);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        fetch('/api/user/me')
            .then((res) => res.json())
            .then((data: UserData) => {
            setUser(data);
            setForm(data);
            setLoading(false);
        });
    }, []);
    function startEdit() {
        setForm(user);
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setEditing(true);
    }
    function cancelEdit() {
        setForm(user);
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setEditing(false);
    }
    function updateField(name: keyof UserData, value: string) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }
    async function handleSave() {
        setError('');
        if (password && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password && user.hasPassword && !currentPassword) {
            setError('Please enter your current password.');
            return;
        }
        setSaving(true);
        const res = await fetch('/api/user/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                gender: form.gender,
                country: form.country,
                phoneCountryCode: form.phoneCountryCode,
                phone: form.phone,
                birthYear: form.birthYear,
                birthMonth: form.birthMonth,
                birthDay: form.birthDay,
                ...(password ? { password, confirmPassword, currentPassword } : {}),
            }),
        });
        setSaving(false);
        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? 'Something went wrong.');
            return;
        }
        const updated = { ...form, hasPassword: password ? true : form.hasPassword };
        setUser(updated);
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        setEditing(false);
    }
    async function handleDeleteAccount() {
        setDeleteError('');
        if (user.hasPassword && !deletePassword) {
            setDeleteError('Please enter your password.');
            return;
        }
        setDeleting(true);
        const res = await fetch('/api/user/me', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user.hasPassword ? { password: deletePassword } : {}),
        });
        setDeleting(false);
        if (!res.ok) {
            const data = await res.json();
            setDeleteError(data.error ?? 'Something went wrong.');
            return;
        }
        signOut({ callbackUrl: '/' });
    }
    if (loading)
        return null;
    return (<div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px 120px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Personal Information
      </h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 40 }}>
        Your account information can only be viewed by you.
      </p>

      <div style={{ border: '1px solid #eee', padding: '8px 24px' }}>
      {!editing ? (<>
          <FieldRow label="Name" value={[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || '—'}/>
          <FieldRow label="Nationality" value={user.country ? countryName(user.country) : '—'}/>
          <FieldRow label="Gender" value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '—'}/>
          <FieldRow label="Email" value={user.email}/>
          <FieldRow label="Password" value="••••••••"/>
          <FieldRow label="Phone" value={user.phone ? `${user.phoneCountryCode}  ${user.phone}` : '—'}/>
          <FieldRow label="Birthday" value={formatBirthday(user.birthYear, user.birthMonth, user.birthDay)}/>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button onClick={startEdit} style={filledBtn}>
              Edit
            </button>
          </div>
        </>) : (<>
          <EditRow label="Name">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="First name" style={{ ...inputStyle, flex: '1 1 100px' }}/>
              <input value={form.middleName} onChange={(e) => updateField('middleName', e.target.value)} placeholder="Middle name" style={{ ...inputStyle, flex: '1 1 100px' }}/>
              <input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Last name" style={{ ...inputStyle, flex: '1 1 100px' }}/>
            </div>
          </EditRow>

          <EditRow label="Nationality">
            <select value={form.country} onChange={(e) => updateField('country', e.target.value)} style={selectStyle}>
              <option value="">Select</option>
              {COUNTRIES.map((c) => (<option key={c.code} value={c.code}>
                  {c.name}
                </option>))}
            </select>
          </EditRow>

          <EditRow label="Gender">
            <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)} style={selectStyle}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Prefer not to say</option>
            </select>
          </EditRow>

          <EditRow label="Email">
            <div>
              <input value={form.email} disabled style={{ ...inputStyle, color: '#999', background: '#f7f7f7' }}/>
              <p style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                To change your email, please contact support.
              </p>
            </div>
          </EditRow>

          {user.hasPassword && password && (<EditRow label="Current Password">
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter your current password" style={inputStyle}/>
            </EditRow>)}

          <EditRow label="Password">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" style={inputStyle}/>
          </EditRow>

          <EditRow label="Confirm Password">
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" style={inputStyle}/>
          </EditRow>

          <EditRow label="Phone">
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.phoneCountryCode} onChange={(e) => updateField('phoneCountryCode', e.target.value)} style={{ ...selectStyle, width: 110 }}>
                <option value="">Code</option>
                {CALLING_CODES.map(({ country, code }) => (<option key={`${country}-${code}`} value={code}>
                    {code} ({country})
                  </option>))}
              </select>
              <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone number" style={{ ...inputStyle, flex: 1 }}/>
            </div>
          </EditRow>

          <EditRow label="Birthday">
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.birthYear} onChange={(e) => updateField('birthYear', e.target.value)} style={selectStyle}>
                <option value="">Year</option>
                {YEARS.map((y) => (<option key={y} value={y}>
                    {y}
                  </option>))}
              </select>
              <select value={form.birthMonth} onChange={(e) => updateField('birthMonth', e.target.value)} style={selectStyle}>
                <option value="">Month</option>
                {MONTHS.map((m, i) => (<option key={m} value={String(i + 1)}>
                    {m}
                  </option>))}
              </select>
              <select value={form.birthDay} onChange={(e) => updateField('birthDay', e.target.value)} style={selectStyle}>
                <option value="">Day</option>
                {DAYS.map((d) => (<option key={d} value={d}>
                    {d}
                  </option>))}
              </select>
            </div>
          </EditRow>

          {error && <p style={{ color: '#d33', fontSize: 13, marginTop: 8 }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
            <button onClick={cancelEdit} style={outlineBtn}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={filledBtn}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </>)}
      </div>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #eee' }}>
        {!showDeleteConfirm ? (<button onClick={() => {
                setShowDeleteConfirm(true);
                setDeletePassword('');
                setDeleteError('');
            }} style={{
                background: 'none',
                border: 'none',
                color: '#999',
                fontSize: 13,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
            }}>
            Delete account
          </button>) : (<div style={{ border: '1px solid #d33', borderRadius: 8, padding: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#d33' }}>
              Delete your account
            </p>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              This permanently deletes your account and login info. Reviews and
              comments you&apos;ve written will stay, but will no longer be
              linked to your account. This can&apos;t be undone.
            </p>

            {user.hasPassword && (<input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter your password to confirm" style={{ ...inputStyle, marginBottom: 12 }}/>)}

            {deleteError && (<p style={{ color: '#d33', fontSize: 13, marginBottom: 12 }}>{deleteError}</p>)}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={outlineBtn}>
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting} style={{ ...filledBtn, background: '#d33' }}>
                {deleting ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </div>)}
      </div>
    </div>);
}
function FieldRow({ label, value }: {
    label: string;
    value: string;
}) {
    return (<div style={{
            display: 'flex',
            gap: 24,
            padding: '16px 0',
            alignItems: 'baseline',
            borderBottom: '1px solid #eee',
        }}>
      <span style={{ width: 110, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#333' }}>{value}</span>
    </div>);
}
function EditRow({ label, children }: {
    label: string;
    children: React.ReactNode;
}) {
    return (<div style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>);
}
const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
};
const selectStyle: React.CSSProperties = {
    ...inputStyle,
    background: '#fff',
};
const filledBtn: React.CSSProperties = {
    background: '#2d5a45',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
};
const outlineBtn: React.CSSProperties = {
    background: '#fff',
    color: '#2d5a45',
    border: '1px solid #2d5a45',
    borderRadius: 8,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
};
