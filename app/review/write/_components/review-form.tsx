'use client';

import { useState, useEffect, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CountryCombobox from '@/components/country-combobox';

type Director = { id: number; number: string; name: string };

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #000',
  fontSize: 14,
};

const DateInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input {...props} ref={ref} style={inputStyle} />,
);
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

export default function ReviewForm() {
  const { data: session } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [country, setCountry] = useState('');
  const [shootingDate, setShootingDate] = useState<Date | null>(null);
  const [productType, setProductType] = useState('');
  const [location, setLocation] = useState('');
  const [directorId, setDirectorId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPassword, setGuestPassword] = useState('');

  const [directors, setDirectors] = useState<Director[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!location) {
      setDirectors([]);
      return;
    }
    fetch(`/api/directors?location=${location}`)
      .then((res) => res.json())
      .then((data) => setDirectors(Array.isArray(data) ? data : []));
  }, [location]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !title.trim() ||
      !content.trim() ||
      !country.trim() ||
      !shootingDate ||
      !productType ||
      !location ||
      !directorId
    ) {
      alert('Please fill in all fields.');
      return;
    }
    if (!session && (!guestName.trim() || !guestPassword.trim())) {
      alert('Please enter your name and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          country,
          shootingDate: shootingDate ? formatDate(shootingDate) : '',
          productType,
          location,
          directorId,
          rating: null, // 추후 사용 예정 — 지금은 항상 null로 전송
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 추후 사용 예정 — 별점(Rating) UI 임시 비활성화
      <div>
        <label style={labelStyle}>Rating *</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
              aria-pressed={n <= rating}
              style={{
                fontSize: 28,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: n <= rating ? '#f5b301' : '#000',
                padding: 0,
              }}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      */}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Product *</label>
          <select style={inputStyle} value={productType} onChange={(e) => setProductType(e.target.value)}>
            <option value="">Select</option>
            <option value="wedding">Wedding</option>
            <option value="snap">Snap</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Location *</label>
          <select
            style={inputStyle}
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setDirectorId('');
            }}
          >
            <option value="">Select</option>
            <option value="jeju">Jeju</option>
            <option value="seoul">Seoul</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Photographer *</label>
          <select
            style={inputStyle}
            value={directorId}
            disabled={!location}
            onChange={(e) => setDirectorId(e.target.value)}
          >
            <option value="">Select</option>
            {directors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.number} {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Shooting Date *</label>
          <DatePicker
            selected={shootingDate}
            onChange={(date: Date | null) => setShootingDate(date)}
            dateFormat="MM/dd/yyyy"
            placeholderText="MM/DD/YYYY"
            customInput={<DateInput />}
            wrapperClassName="w-full"
          />
        </div>
        <div>
          <label style={labelStyle}>Country *</label>
          <CountryCombobox value={country} onChange={setCountry} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Title *</label>
        <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label style={labelStyle}>Content *</label>
        <textarea
          style={{ ...inputStyle, minHeight: 160, resize: 'vertical' }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {!session && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Password * (needed to edit/delete)</label>
            <input
              style={inputStyle}
              type="password"
              value={guestPassword}
              onChange={(e) => setGuestPassword(e.target.value)}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '14px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
