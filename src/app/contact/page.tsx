import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { getSiteUrl, CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact AirScope India for corrections, data questions or partnerships.',
  alternates: { canonical: `${getSiteUrl()}/contact` },
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact" updated="14 November 2026">
      <p>
        For corrections, a station that looks wrong, data questions, advertising or partnerships, email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We read every message and aim to reply within a few days.
      </p>
      <p>When reporting a data problem, please include the station name, what you saw, and the time you saw it.</p>
    </LegalPage>
  );
}
