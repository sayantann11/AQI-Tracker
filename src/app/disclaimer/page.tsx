import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Medical, data accuracy, affiliate and independence disclaimer for AirScope India.',
  alternates: { canonical: `${getSiteUrl()}/disclaimer` },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated="14 November 2026">
      <h2>Not medical advice</h2>
      <p>
        Health guidance on this site follows publicly available CPCB categories and is for general awareness only. It does not replace advice
        from a qualified doctor. If you have chest pain, severe breathlessness or other urgent symptoms, seek medical care.
      </p>
      <h2>Data accuracy</h2>
      <p>
        Readings come from third-party feeds and may be unvalidated, delayed or later corrected. Values marked with ≈ or &ldquo;Estimated&rdquo; are
        calculated from nearby stations or an atmospheric model and are not sensor measurements; they can differ from the air at your exact location.
      </p>
      <h2>Not a government service</h2>
      <p>
        AirScope India is independent and is not affiliated with, endorsed by or operated by the Government of India, CPCB, DPCC, UPPCB or HSPCB.
      </p>
      <h2>Affiliate and advertising disclosure</h2>
      <p>
        We may earn commissions from qualifying purchases made through affiliate links (including the Amazon Associates Programme) and revenue from
        advertising. This never changes the air quality values we display.
      </p>
    </LegalPage>
  );
}
