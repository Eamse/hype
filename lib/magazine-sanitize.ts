import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 's', 'a',
  'h1', 'h2', 'h3',
  'ul', 'ol', 'li',
  'blockquote', 'img',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'target', 'rel'];

export function sanitizeMagazineHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
