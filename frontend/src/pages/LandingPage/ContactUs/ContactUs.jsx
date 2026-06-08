import { useState } from "react";
import { submitContact } from "../../../api/bookings.api";
import styles from "./ContactUs.module.css";

const CONTACT_INFO = [
  { icon: "📍", label: "Address",   value: "House 12, Road 5, Dhanmondi, Dhaka 1205" },
  { icon: "📞", label: "Phone",     value: "+880 1700-000000" },
  { icon: "✉️", label: "Email",     value: "hello@finaltouchstudio.com" },
  { icon: "🕐", label: "Hours",     value: "Sat–Thu, 10am – 8pm" },
];

export default function ContactUs() {
  const [form,    setForm]    = useState({ name:"", email:"", occasion:"", message:"" });
  const [status,  setStatus]  = useState(null); // "sending" | "sent" | "error"

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitContact(form);
      setStatus("sent");
      setForm({ name:"", email:"", occasion:"", message:"" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className={styles.section} aria-label="Contact us">
      <div className={styles.inner}>
        {/* Left — info */}
        <div className={styles.info}>
          <p className={styles.eyebrow}>Get in Touch</p>
          <h2 className={styles.heading}>Let's Plan Your Perfect Event</h2>
          <p className={styles.sub}>
            Tell us about your occasion and we'll get back to you within 2 hours
            with ideas, pricing and availability.
          </p>

          <ul className={styles.contactList}>
            {CONTACT_INFO.map((c) => (
              <li key={c.label} className={styles.contactItem}>
                <span className={styles.contactIcon}>{c.icon}</span>
                <div>
                  <p className={styles.contactLabel}>{c.label}</p>
                  <p className={styles.contactValue}>{c.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="c-name">Your Name</label>
              <input id="c-name" name="name" type="text" placeholder="Fatima Akter" required value={form.name} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label htmlFor="c-email">Email Address</label>
              <input id="c-email" name="email" type="email" placeholder="you@example.com" required value={form.email} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="c-occasion">Occasion Type</label>
            <input id="c-occasion" name="occasion" type="text" placeholder="e.g. Wedding Reception, Holud…" value={form.occasion} onChange={handleChange} />
          </div>
          <div className={styles.field}>
            <label htmlFor="c-message">Your Message</label>
            <textarea id="c-message" name="message" rows={5} placeholder="Tell us your vision, event date, guest count…" required value={form.message} onChange={handleChange} />
          </div>

          <button type="submit" className={styles.submit} disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send Message ✦"}
          </button>

          {status === "sent"  && <p className={styles.msgSuccess}>✅ Message sent! We'll reply shortly.</p>}
          {status === "error" && <p className={styles.msgError}>⚠️ Something went wrong. Please try again or call us.</p>}
        </form>
      </div>
    </section>
  );
}
