import DOMPurify from 'isomorphic-dompurify';
const ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 's', 'a',
    'h1', 'h2', 'h3',
    'ul', 'ol', 'li',
    'blockquote', 'img',
];
const ALLOWED_ATTR = ['href', 'src', 'alt', 'target', 'rel'];
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
    }
});
export function sanitizeMagazineHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
    });
}
