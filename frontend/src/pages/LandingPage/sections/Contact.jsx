import { useState } from "react";
import { submitContact } from "../../../api/bookings.api";
import { Alert, Button, Card, ClockIcon, Field, MailIcon, PhoneIcon, PinIcon, Section, SectionHeading } from "../../../components/ui";
import { CONTACT } from "../../../constants/site";
import styles from "../LandingPage.module.css";

const EMPTY_FORM = { name: "", email: "", occasion: "", message: "" };

const DETAILS = [
  { Icon: PinIcon, label: "Studio", value: CONTACT.address },
  { Icon: PhoneIcon, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phoneHref}` },
  { Icon: MailIcon, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { Icon: ClockIcon, label: "Hours", value: CONTACT.hours },
];

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");
    try {
      await submitContact(form);
      setForm(EMPTY_FORM);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Section id="contact" aria-label="Contact us">
      <div className={styles.contactGrid}>
        <div>
          <SectionHeading
            eyebrow="Get in touch"
            title="Let’s plan your event"
            lead="Tell us about your occasion and we will reply within one business day with ideas, pricing and availability."
          />
          <ul className={styles.contactList}>
            {DETAILS.map(({ Icon, label, value, href }) => (
              <li key={label}>
                <span className={styles.contactIcon}>
                  <Icon />
                </span>
                <span>
                  <span className={styles.contactLabel}>{label}</span>
                  {href ? (
                    <a href={href} className={styles.contactValue}>
                      {value}
                    </a>
                  ) : (
                    <span className={styles.contactValue}>{value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Card as="form" padded className={styles.contactForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <Field label="Your name" name="name" autoComplete="name" required value={form.name} onChange={handleChange} />
            <Field label="Email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} />
          </div>
          <Field
            label="Occasion"
            name="occasion"
            placeholder="e.g. Wedding reception, Holud, 30th birthday"
            value={form.occasion}
            onChange={handleChange}
          />
          <Field
            as="textarea"
            label="Message"
            name="message"
            rows={5}
            placeholder="Your event date, venue, guest count and the look you have in mind"
            required
            value={form.message}
            onChange={handleChange}
          />

          <Button type="submit" size="lg" loading={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send message"}
          </Button>

          {status === "sent" && <Alert tone="success">Thank you — your message is on its way. We will be in touch shortly.</Alert>}
          {status === "error" && (
            <Alert tone="error">Something went wrong sending your message. Please try again or call us.</Alert>
          )}
        </Card>
      </div>
    </Section>
  );
}
