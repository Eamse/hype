'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, Mail } from 'lucide-react';
const WEDDING_FORM_URL = 'https://forms.gle/oJu6ZPBdhiLWaELDA';
const SNAP_FORM_URL = 'https://forms.gle/3sWqu4NED5ruJEnN9';
const CONTACT_EMAIL = 'hypepig227@gmail.com';
const WHATSAPP_URL = 'http://Wa.me/+821062695990';
const WECHAT_URL = 'https://u.wechat.com/kAo3Jp9jOyXemuB2BBeo6Vc?s=2';
const LINE_URL = 'https://line.me/ti/p/MxawLJXY5t';
function useReplayReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
    const timers = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const existing = timers.get(target);
          if (existing) clearTimeout(existing);
          if (entry.isIntersecting) {
            const delay = Number(target.dataset.revealDelay ?? 0);
            const timer = window.setTimeout(
              () => target.classList.add('visible'),
              delay,
            );
            timers.set(target, timer);
          } else {
            target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );
    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [ref]);
}
export default function InquiryClient() {
  const ctaRef = useRef<HTMLDivElement>(null);
  useReplayReveal(ctaRef);
  return (
    <section ref={ctaRef} className="inquiry-cta">
      <p
        className="inquiry-eyebrow inquiry-fade"
        data-reveal
        data-reveal-delay="0"
      >
        YOUR NEXT STEP
      </p>
      <h2
        className="inquiry-heading inquiry-fade"
        data-reveal
        data-reveal-delay="200"
      >
        Start your Inquiry
      </h2>
      <p
        className="inquiry-cta-body inquiry-fade"
        data-reveal
        data-reveal-delay="320"
      >
        Choose your session type and fill out the form.
        <br />
        We will be in touch within 1–2 business days.
      </p>
      <div className="inquiry-cta-buttons">
        <a
          href={WEDDING_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inquiry-btn inquiry-btn--filled inquiry-rise"
          data-reveal
          data-reveal-delay="440"
        >
          HYPE WEDDING
          <ArrowRight size={16} strokeWidth={2.5} />
        </a>
        <a
          href={SNAP_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inquiry-btn inquiry-btn--outline inquiry-rise"
          data-reveal
          data-reveal-delay="440"
        >
          HYPE SNAP
          <ArrowRight size={16} strokeWidth={2.5} />
        </a>
      </div>

      <div
        className="inquiry-fade"
        data-reveal
        data-reveal-delay="560"
        style={{ marginTop: 'clamp(40px, 5vw, 64px)', textAlign: 'center' }}
      >
        <p
          style={{
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 7,
          }}
        >
          Contact
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          <Mail size={16} strokeWidth={2} />
          {CONTACT_EMAIL}
        </a>
        <div
          style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <ContactButton
            href={WHATSAPP_URL}
            label="Whatsapp"
            icon="/icons/sns/whatsapp.svg"
          />
          <ContactButton
            href={WECHAT_URL}
            label="Wechat"
            icon="/icons/sns/wechat.svg"
          />
          <ContactButton
            href={LINE_URL}
            label="Line"
            icon="/icons/sns/line.png"
          />
        </div>
      </div>
    </section>
  );
}
function ContactButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: 130,
        border: '1px solid rgba(0,0,0,0.45)',
        borderRadius: 8,
        padding: '9px 0',
        fontSize: 14,
        fontWeight: 600,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <Image src={icon} alt="" width={16} height={16} />
      {label}
    </a>
  );
}
