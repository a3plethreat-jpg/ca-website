import { contact } from "../lib/content";
import InquiryForm from "./InquiryForm";

export default function Contact() {
  const wa = contact.whatsapp.replace(/\D/g, "");
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative flex min-h-screen items-center py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-bg/90 via-bg/55 to-bg/30" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div data-reveal="true">
          <p className="eyebrow">Join the camp</p>
          <h2 id="contact-title" className="display mt-3 text-[clamp(2.8rem,8vw,6.5rem)]">{contact.heading}</h2>
          <div className="rule mt-5 w-32" />
          <p className="mt-5 max-w-md text-lg text-silver">{contact.text}</p>
          <dl className="mt-8 space-y-4">
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-1 text-lg">
                <a className="underline decoration-brand-green underline-offset-4" href={`mailto:${contact.email}`}>{contact.email}</a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">WhatsApp</dt>
              <dd className="mt-1 text-lg">
                <a className="underline decoration-brand-green underline-offset-4" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">{contact.whatsapp}</a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Location</dt>
              <dd className="mt-1 text-lg">{contact.location}</dd>
            </div>
          </dl>
          <ul className="mt-6 flex gap-5">
            {contact.social.map((s) => (
              <li key={s.label}>
                <a className="display text-lg tracking-widest underline-offset-4 hover:underline" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal="true">
          <InquiryForm />
        </div>
      </div>
    </section>
  );
}
