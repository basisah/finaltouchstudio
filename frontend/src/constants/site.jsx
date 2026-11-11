/**
 * Business details shown in the footer, contact section and about page.
 * Edit here — nothing else hard-codes them.
 */
export const CONTACT = {
  address: "Saskatoon, SK, Canada",
  phone: "+1 (306) 555-0199",
  phoneHref: "+13065550199",
  email: "finaltouchstudiosask@gmail.com",
  hours: "Mon–Fri, 9am – 6pm",
};

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.5 21v-7.2h2.4l.4-3h-2.8V8.9c0-.9.3-1.4 1.5-1.4h1.4V4.8c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.3H8v3h2.5V21z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20l1.3-4.2A8 8 0 1 1 8.3 19z" />
    <path d="M9 8.5c0 3 2.5 5.5 5.5 5.5l1-1.5-1.8-1-.9.9a4 4 0 0 1-1.7-1.7l.9-.9-1-1.8z" fill="currentColor" stroke="none" />
  </svg>
);
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.5 3c.3 2.1 1.6 3.6 3.7 3.8v2.8a6.7 6.7 0 0 1-3.6-1.1v6.3a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.9a2.9 2.9 0 1 0 2 2.7V3z" />
  </svg>
);

export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com", Icon: FacebookIcon },
  { label: "Instagram", href: "https://www.instagram.com", Icon: InstagramIcon },
  { label: "WhatsApp", href: "https://wa.me/13065550199", Icon: WhatsAppIcon },
  { label: "TikTok", href: "https://www.tiktok.com", Icon: TikTokIcon },
];
