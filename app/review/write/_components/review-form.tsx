'use client';
import { useState, useEffect, useMemo, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CountryCombobox from '@/components/country-combobox';
type Director = {
  id: number;
  number: string;
  name: string;
  location: string | null;
  category: string;
};
function formatDirectorLabel(d: Director) {
  const categoryLabel = d.category === 'snap' ? 'Snap' : 'Wedding';
  const locationLabel = d.location === 'Jeju' ? 'Jeju' : 'Seoul';
  const num = d.number.replace('#', '').split('-')[0].padStart(2, '0');
  return `${categoryLabel} | ${locationLabel} ${num} - ${d.name}`;
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #000',
  fontSize: 14,
  background: '#fff',
  color: '#000',
};
const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1.5px solid #dc2626',
};
type FormErrors = {
  productType?: boolean;
  location?: boolean;
  directorId?: boolean;
  shootingDate?: boolean;
  country?: boolean;
  content?: boolean;
  guestName?: boolean;
  guestPassword?: boolean;
  guestPasswordConfirm?: boolean;
};
const DateInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input {...props} ref={ref} style={props.style ?? inputStyle} />);
DateInput.displayName = 'DateInput';
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#000',
  marginBottom: 6,
};
const errorTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#dc2626',
  margin: '4px 0 0',
};
function ErrorText({ show, children }: { show?: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return <p style={errorTextStyle}>{children}</p>;
}
export default function ReviewForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [country, setCountry] = useState('');
  const [shootingDate, setShootingDate] = useState<Date | null>(null);
  const [productType, setProductType] = useState('');
  const [location, setLocation] = useState('');
  const [directorId, setDirectorId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [guestPasswordConfirm, setGuestPasswordConfirm] = useState('');
  const [directors, setDirectors] = useState<Director[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  useEffect(() => {
    fetch('/api/directors')
      .then((res) => res.json())
      .then((data) => setDirectors(Array.isArray(data) ? data : []));
  }, []);
  const filteredDirectors = useMemo(
    () =>
      directors.filter(
        (d) =>
          (!location || d.location?.toLowerCase() === location) &&
          (!productType || d.category === productType),
      ),
    [directors, location, productType],
  );
  function handleDirectorChange(id: string) {
    setDirectorId(id);
    const selected = directors.find((d) => String(d.id) === id);
    if (selected?.location) {
      setLocation(selected.location.toLowerCase());
    }
    if (selected?.category) {
      setProductType(selected.category);
    }
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: FormErrors = {
      productType: !productType,
      location: !location,
      directorId: !directorId,
      shootingDate: !shootingDate,
      country: !country.trim(),
      content: !content.trim(),
      ...(!session && {
        guestName: !guestName.trim(),
        guestPassword: !guestPassword.trim(),
        guestPasswordConfirm: guestPassword !== guestPasswordConfirm,
      }),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      if (!session && guestPassword && guestPasswordConfirm && guestPassword !== guestPasswordConfirm) {
        alert('Passwords do not match.');
      } else {
        alert('Please fill in all fields.');
      }
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          country,
          shootingDate: shootingDate ? formatDate(shootingDate) : '',
          productType,
          location,
          directorId,
          rating: null,
          name: guestName,
          password: guestPassword,
        }),
      });
      if (!res.ok) {
        alert((await res.json()).error ?? 'Failed to submit.');
        return;
      }
      const review = await res.json();
      router.push(`/review/${review.id}`);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Product *</label>
          <select
            style={errors.productType ? errorInputStyle : inputStyle}
            value={productType}
            onChange={(e) => {
              setProductType(e.target.value);
              setDirectorId('');
              setErrors((prev) => ({ ...prev, productType: false }));
            }}
          >
            <option value="">Select</option>
            <option value="wedding">Wedding</option>
            <option value="snap">Snap</option>
          </select>
          <ErrorText show={errors.productType}>Required</ErrorText>
        </div>
        <div>
          <label style={labelStyle}>Location *</label>
          <select
            style={errors.location ? errorInputStyle : inputStyle}
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setDirectorId('');
              setErrors((prev) => ({ ...prev, location: false }));
            }}
          >
            <option value="">Select</option>
            <option value="jeju">Jeju</option>
            <option value="seoul">Seoul</option>
          </select>
          <ErrorText show={errors.location}>Required</ErrorText>
        </div>
        <div>
          <label style={labelStyle}>Photographer *</label>
          <select
            style={errors.directorId ? errorInputStyle : inputStyle}
            value={directorId}
            onChange={(e) => {
              handleDirectorChange(e.target.value);
              setErrors((prev) => ({ ...prev, directorId: false, location: false }));
            }}
          >
            <option value="">Select</option>
            {filteredDirectors.map((d) => (
              <option key={d.id} value={d.id}>
                {formatDirectorLabel(d)}
              </option>
            ))}
          </select>
          <ErrorText show={errors.directorId}>Required</ErrorText>
        </div>
        <div>
          <label style={labelStyle}>Shooting Date *</label>
          <DatePicker
            selected={shootingDate}
            onChange={(date: Date | null) => {
              setShootingDate(date);
              setErrors((prev) => ({ ...prev, shootingDate: false }));
            }}
            dateFormat="MM/dd/yyyy"
            placeholderText="MM/DD/YYYY"
            customInput={<DateInput style={errors.shootingDate ? errorInputStyle : inputStyle} />}
            wrapperClassName="w-full"
          />
          <ErrorText show={errors.shootingDate}>Required</ErrorText>
        </div>
        <div>
          <label style={labelStyle}>Country *</label>
          <CountryCombobox value={country} onChange={(v) => {
              setCountry(v);
              setErrors((prev) => ({ ...prev, country: false }));
            }} />
          <ErrorText show={errors.country}>Required</ErrorText>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Content *</label>
        <textarea
          style={{ ...(errors.content ? errorInputStyle : inputStyle), minHeight: 160, resize: 'vertical' }}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setErrors((prev) => ({ ...prev, content: false }));
          }}
        />
        <ErrorText show={errors.content}>Required</ErrorText>
      </div>

      {!session && (
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        >
          <div>
            <label style={labelStyle}>Name *</label>
            <input
              style={errors.guestName ? errorInputStyle : inputStyle}
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                setErrors((prev) => ({ ...prev, guestName: false }));
              }}
            />
            <ErrorText show={errors.guestName}>Required</ErrorText>
          </div>
          <div />
          <div>
            <label style={labelStyle}>Password</label>
            <input
              style={errors.guestPassword ? errorInputStyle : inputStyle}
              type="password"
              value={guestPassword}
              onChange={(e) => {
                setGuestPassword(e.target.value);
                setErrors((prev) => ({ ...prev, guestPassword: false, guestPasswordConfirm: false }));
              }}
            />
            <ErrorText show={errors.guestPassword}>Required</ErrorText>
          </div>
          <div>
            <label style={labelStyle}>Verify Password *</label>
            <input
              style={errors.guestPasswordConfirm ? errorInputStyle : inputStyle}
              type="password"
              value={guestPasswordConfirm}
              onChange={(e) => {
                setGuestPasswordConfirm(e.target.value);
                setErrors((prev) => ({ ...prev, guestPasswordConfirm: false }));
              }}
            />
            <ErrorText show={errors.guestPasswordConfirm}>
              {guestPassword && guestPasswordConfirm && guestPassword !== guestPasswordConfirm ? 'Passwords do not match' : 'Required'}
            </ErrorText>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '14px',
          background: '#2d5a45',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit a Review'}
      </button>
    </form>
  );
}
