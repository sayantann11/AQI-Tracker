import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms for using the AirScope India air quality tracker.',
  alternates: { canonical: `${getSiteUrl()}/terms` },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="14 November 2026">
      <p>By using this site you agree to these terms. If you do not agree, please do not use it.</p>
      <h2>Information only</h2>
      <p>
        Air quality values, health tips and product guides are provided for general information. They are not medical advice. See the{' '}
        <a href="/disclaimer">Disclaimer</a>.
      </p>
      <h2>Availability and accuracy</h2>
      <p>
        We rely on third-party government and scientific data feeds that can be delayed, revised or unavailable. The site is provided
        &ldquo;as is&rdquo; without warranties, and we may change or stop it at any time.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not scrape the site in a way that degrades it, attempt to overload or break it, or present our content as official
        government data. Our own code is MIT licensed; the underlying data remains subject to each provider&rsquo;s licence.
      </p>
      <h2>Links and ads</h2>
      <p>We link to third-party sites and may display advertising. We do not control and are not responsible for third-party content.</p>
      <h2>Liability</h2>
      <p>To the extent permitted by law, we are not liable for any loss arising from use of, or inability to use, the site or its data.</p>
    </LegalPage>
  );
}
