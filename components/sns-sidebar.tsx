'use client';

import Image from 'next/image';

const SNS_ITEMS = [
  {
    href: 'https://www.instagram.com/hypewedd_ing/',
    label: 'Instagram',
    src: '/instagram.png',
    size: 30,
  },
  {
    href: 'https://www.tiktok.com/@hypewedd_ing?is_from_webapp=1&sender_device=pc',
    label: 'TikTok',
    src: '/tik-tok-.png',
    size: 42,
  },
  {
    href: 'https://www.xiaohongshu.com/user/profile/68bd1504000000001900e6ce?xsec_token=YBMg8vCI4LO656HzjI7Q_5tfZGjz44HbsykFqCbOSGbVo=&xsec_source=app_share&xhsshare=CopyLink&shareRedId=OD43Rkc3NUs2NzUyOTgwNjdHOTc9SUdL&apptime=1762704731&share_id=98082e4821c349e9bebae43fcc205dd9',
    label: 'Xiaohongshu',
    src: '/xiaohounshu.png',
    size: 42,
  },
];

export default function SnsSidebar() {
  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        // borderLeft: '2px solid black', 추후 사용
        borderRadius: '8px 0 0 8px',
        overflow: 'hidden',
        paddingRight: '10px',
      }}
    >
      {SNS_ITEMS.map(({ href, label, src, size }, i) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: 52,
            height: 52,
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            // borderTop: i !== 0 ? '1px solid #2a2a2a' : undefined, 추후 사용
            borderRadius:
              i === 0
                ? '4px 0 0 0'
                : i === SNS_ITEMS.length - 1
                  ? '0 0 0 4px'
                  : undefined,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#F3F4F4';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'white';
          }}
        >
          <Image
            src={src}
            alt={label}
            width={size}
            height={size}
            style={{ objectFit: 'contain' }}
          />
        </a>
      ))}
    </div>
  );
}
