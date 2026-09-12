'use client';
import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
const CATEGORIES = [
    'Booking & Planning',
    'Photography & Styling',
    'Styling & Outfits',
    'Props & Special Requests',
    'Jeju Locations',
    'Delivery & Files',
    'Pricing & Payment',
    'International Couples',
] as const;
type Category = (typeof CATEGORIES)[number];
const FAQ_DATA: Record<Category, {
    q: string;
    a: string;
}[]> = {
    'Booking & Planning': [
        {
            q: 'How far in advance should I book?',
            a: 'We recommend booking at least 4-5 months in advance, especially during peak seasons (spring & autumn). However, we can accommodate last-minute bookings based on availability.',
        },
        {
            q: "What's included in the package price?",
            a: 'All packages include professional photography, hair & makeup, gown rental (dress & suit), fresh bouquet, interpreter service, and local transportation. No hidden fees!',
        },
    ],
    'Photography & Styling': [
        {
            q: 'How many photos will we receive?',
            a: 'Standard editing takes 8-9 weeks. Rush editing (2 weeks) is available for an additional fee.',
        },
        {
            q: 'How long deoes editing take?',
            a: "We monitor the weather closely and will work with you to find the best solution, whether it's rescheduling or finding a beautiful indoor location.",
        },
        {
            q: 'Can we choose our phtographer?',
            a: "Yes! We'll show you portfolios of available photographers and you can select based on your preferred style.",
        },
        {
            q: 'What if the weather is bad?',
            a: 'We monitor weather closely and can reschedule if needed. We also have beautiful indoor backup locations.',
        },
    ],
    'Styling & Outfits': [
        {
            q: 'What size are available for gowns?',
            a: "Most dresses are available in sizes 44-66 (Korean sizing). Some dress shops can provide up to size 99. We'll discuss size availability in detail during your consultation.",
        },
        {
            q: 'Can we bring our own outfits?',
            a: 'Of course! Many couples bring meaningful outfits. We can also combine your pieces with our rental items',
        },
        {
            q: 'Is hair & make up included for both partners?',
            a: 'Hair & makeup for the bride and Groom are included.',
        },
        {
            q: 'What should we bring ourselves?',
            a: "Brides need to bring their own shoes, and grooms need to bring shirts and shoes. Since we mainly shoot outdoors, we recommend bringing affordable, comfortable shoes that you don't mind getting dirty.",
        },
    ],
    'Props & Special Requests': [
        {
            q: 'Can we props during our shoot?',
            a: `Yes! However, please note:
    • Sparklers: Some venues don't allow sparklers - we'll confirm availability during consultation
    • Fireworks/Sparklers: Must be purchased locally in Korea (cannot bring on airplane). Available at Daiso stores
    • Other props: You'll need to bring your own props`,
        },
        {
            q: 'Can you help arrange special props like cakes or balloons?',
            a: "Yes! We can arrange items like cakes and balloons through our local vendor partners for an additional fee. We'll provide quotes during consultation.",
        },
        {
            q: 'Are there any restrictions on porps?',
            a: "Each location may have different rules. We'll review your prop requests during consultation and confirm what's permitted at your chosen venues.",
        },
    ],
    'Jeju Locations': [
        {
            q: 'Which locations do you recommend?',
            a: "We'll recommend locations based on your style preferences - from dramatic cliffs and beaches to charming villages and volcanic landscapes.",
        },
        {
            q: 'Do you shoot at sunrise/sunset?',
            a: "Yes! Golden hour shoots are very popular. We'll arrange timing based on season and location.",
        },
        {
            q: 'Is transportation included to all locations?',
            a: 'Yes, local transportation between locations is included in all packages.',
        },
        {
            q: 'What if the weather is bad?',
            a: 'We monitor weather closely and can reschedule if needed. We also have beautiful indoor backup locations.',
        },
    ],
    'Delivery & Files': [
        {
            q: 'How will we receive our photos?',
            a: 'Photos are delivered via secure online gallery where you can view, download, and share your images.',
        },
        {
            q: 'Do we get the raw/unedited files?',
            a: 'We provide professionally edited photos.',
        },
    ],
    'Pricing & Payment': [
        {
            q: 'What are your payment terms?',
            a: '70% deposit to secure your date, remaining 30% due 1 week before your shoot.',
        },
        {
            q: 'What payment method do you accept?',
            a: `Secure & Simple Payment with Wise

To provide you with the most competitive exchange rates and a transparent process, Hype Wedding uses Wise, a leading global payment service.

Once your booking details are finalized, we will send you a secure Wise payment link. You can choose one of the two convenient methods below:

Credit or Debit Card (Instant)
  • How: Click the link → Enter your card details.
  • Pros: Instant confirmation.
  • Supports: Visa, Mastercard, Apple Pay, Google Pay, etc.

Bank Transfer (Manual)
  • How: Click the link → Select "Manual Bank Transfer".
  • Pros: Ideal for those who prefer using their own banking app.
  • Process: Wise will provide you with a local or virtual account number. Simply transfer the amount from your banking app, and your booking will be confirmed once the transfer is verified.

Note:
  • All payments are securely processed through Wise's system.
  • Transfer fees and intermediary bank charges are the customer's responsibility.`,
        },
        {
            q: "What's your cancellation policy?",
            a: `All cancellation requests must be submitted in writing via email. The cancellation date is determined by our email receipt date.

Client-Initiated Cancellation

Within 7 days after deposit payment
  • 90% refund (10% cancellation fee)

After 7 days from deposit ~ 30 days before shoot
  • 70% refund (30% cancellation fee)

Within 30 days of scheduled shoot
  • No refund available ❌

Hypewedding Cancellation

We may cancel/reschedule shoots due to:
  • Force majeure events
  • Photographer emergencies (accidents, illness, bereavement)
  • Unforeseen photographer unavailability
  • Unsafe shooting conditions

Your Protection When We Cancel:
✅ Immediate email/phone notification
✅ Two options provided:
  • Free rescheduling (same terms)
  • Full refund
  • Choose within 7 days of our notice
  • Refunds processed within 14 business days

Note: We're not liable for indirect costs like travel or accommodation expenses.`,
        },
        {
            q: 'What happens if the weather is bad?',
            a: `Basic Policy

Schedule changes due to weather conditions on the day of service are not permitted. We proceed as planned.

Weather Response Guidelines

Light Rain (Drizzle, Light Showers)
  • Photoshoot proceeds as scheduled ✅
  • Creative use of umbrellas
  • Unique romantic atmosphere in the rain

Heavy Rain or Snow (5mm+ per hour forecast)
  • Photographer may cancel for safety ❌
  • Safety is our top priority

Benefits When Canceled Due to Heavy Weather:
  • One (1) free rescheduling provided
  • Refund according to policy if rescheduling impossible

Photography Tips:
  • Check weather forecast and prepare accordingly
  • Consider indoor backup locations
  • Rainy day shoots can create stunning romantic results!

Important: Overcast skies or wind are not cancellation reasons.`,
        },
    ],
    'International Couples': [
        {
            q: 'Do you provide English consultation?',
            a: 'Yes! All consultatㅡions and communication are available in English with our bilingual team.',
        },
        {
            q: 'Do you work with couples from all countries?',
            a: 'Absolutely! We welcome couples from around the world and have experience with diverse cultural preferences.',
        },
    ],
};
function ChevronUpIcon() {
    return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>);
}
function ChevronDownIcon() {
    return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>);
}
function SearchIcon() {
    return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>);
}
function FaqItem({ q, a, isOpen, onToggle, }: {
    q: string;
    a: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    function handleShare(platform: 'facebook' | 'twitter' | 'linkedin') {
        const url = encodeURIComponent(window.location.href);
        const targets: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        };
        window.open(targets[platform], '_blank', 'noopener,noreferrer');
    }
    function handleCopyLink() {
        navigator.clipboard.writeText(window.location.href);
    }
    return (<div style={{
            backgroundColor: '#fff',
            border: '1px solid #000',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 12,
        }}>
      <button onClick={onToggle} style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '32px 36px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            gap: 20,
        }}>
        <span style={{
            fontSize: 22,
            fontWeight: 500,
            color: '#000',
            lineHeight: 1.4,
        }}>
          Q: {q}
        </span>
        <span style={{ flexShrink: 0, color: '#000' }}>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </button>

      <div style={{
            maxHeight: isOpen ? '2000px' : '0',
            opacity: isOpen ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.35s ease, opacity 0.25s ease',
        }}>
        <div style={{ padding: '0 36px 32px' }}>
          {a && (<p style={{
                fontSize: 18,
                color: '#000',
                lineHeight: 1.8,
                marginBottom: 24,
                whiteSpace: 'pre-line',
            }}>
              A: {a}
            </p>)}
          <div style={{ display: 'flex', gap: 12, color: '#000' }}>
            <button onClick={() => handleShare('facebook')} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
        }}></button>
            <button onClick={() => handleShare('twitter')} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
        }}></button>
            <button onClick={() => handleShare('linkedin')} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
        }}></button>
            <button onClick={handleCopyLink} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
        }}></button>
          </div>
        </div>
      </div>
    </div>);
}
export default function FaqClient() {
    const [activeCategory, setActiveCategory] = useState<Category>('Booking & Planning');
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [tabFade, setTabFade] = useState({ left: false, right: true });
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const tabsRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    function checkTabFade() {
        const el = tabsRef.current;
        if (!el)
            return;
        setTabFade({
            left: el.scrollLeft > 4,
            right: el.scrollLeft < el.scrollWidth - el.clientWidth - 4,
        });
    }
    useEffect(() => {
        checkTabFade();
        window.addEventListener('resize', checkTabFade);
        return () => window.removeEventListener('resize', checkTabFade);
    }, []);
    const headerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = headerRef.current;
        if (!el)
            return;
        el.querySelectorAll('.inquiry-fade-up').forEach((item, idx) => {
            setTimeout(() => item.classList.add('visible'), idx * 120);
        });
    }, []);
    useEffect(() => {
        const el = listRef.current;
        if (!el)
            return;
        const items = el.querySelectorAll('.faq-item-animate');
        items.forEach((item) => item.classList.remove('visible'));
        requestAnimationFrame(() => {
            items.forEach((item, idx) => {
                setTimeout(() => item.classList.add('visible'), idx * 80);
            });
        });
    }, [activeCategory, searchQuery]);
    const isSearching = searchQuery.trim().length > 0;
    const displayItems = (isSearching
        ? Object.values(FAQ_DATA)
            .flat()
            .filter(({ q, a }) => q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.toLowerCase().includes(searchQuery.toLowerCase()))
        : FAQ_DATA[activeCategory]).filter(({ q }) => q.trim() !== '');
    return (<>
      
      <div ref={headerRef} style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: isMobile ? '40px 20px 24px' : '48px 40px 28px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
        }}>
        <h1 className="inquiry-fade-up type-hero-display" style={{
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#000',
            lineHeight: 1,
            minWidth: isMobile ? 120 : 180,
        }}>
          FAQ
        </h1>
        <div className="inquiry-fade-up" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1.5px solid #000',
            paddingBottom: 4,
            flexShrink: 0,
            width: isMobile ? 160 : 240,
            animationDelay: '0.3s',
        }}>
          <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{
            flex: 1,
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: 14,
            color: '#000',
        }}/>
          <span style={{ color: '#000' }}>
            <SearchIcon />
          </span>
        </div>
      </div>

      
      {!isSearching && (<div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: isMobile ? '0 8px' : '0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            }}>
          
          <button onClick={() => tabsRef.current?.scrollBy({ left: -240, behavior: 'smooth' })} style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid #000',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                opacity: tabFade.left ? 1 : 0,
                pointerEvents: tabFade.left ? 'auto' : 'none',
                transition: 'opacity 0.2s',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          
          <div ref={tabsRef} onScroll={checkTabFade} className="hide-scroll" style={{
                flex: 1,
                display: 'flex',
                overflowX: 'auto',
            }}>
            {CATEGORIES.map((cat) => {
                const isActive = cat === activeCategory;
                return (<button key={cat} onClick={() => {
                        setActiveCategory(cat);
                        setOpenIndex(null);
                    }} onMouseEnter={() => setHoveredTab(cat)} onMouseLeave={() => setHoveredTab(null)} style={{
                        flexShrink: 0,
                        padding: isMobile ? '12px 16px' : '14px 24px',
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        color: isActive
                            ? '#2D5A45'
                            : hoveredTab === cat
                                ? '#000'
                                : '#000',
                        background: 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderBottom: isActive
                            ? '2px solid #2D5A45'
                            : hoveredTab === cat
                                ? '2px solid #000'
                                : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'color 0.2s, border-color 0.2s',
                        whiteSpace: 'nowrap',
                    }}>
                  {cat}
                </button>);
            })}
          </div>

          
          <button onClick={() => tabsRef.current?.scrollBy({ left: 240, behavior: 'smooth' })} style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid #000',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                opacity: tabFade.right ? 1 : 0,
                pointerEvents: tabFade.right ? 'auto' : 'none',
                transition: 'opacity 0.2s',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>)}

      
      <div ref={listRef} style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: isMobile ? '24px 20px 80px' : '32px 40px 80px',
        }}>
        {displayItems.length === 0 ? (<p style={{ color: '#000', fontSize: 14 }}>No results found.</p>) : (displayItems.map(({ q, a }, idx) => (<div key={idx} className="faq-item-animate inquiry-step" style={{ transitionDelay: `${idx * 0.07}s` }}>
              <FaqItem q={q} a={a} isOpen={openIndex === idx} onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}/>
            </div>)))}
      </div>
    </>);
}
