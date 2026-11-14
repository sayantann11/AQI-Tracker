import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { getSiteUrl, CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How AirScope India handles location, cookies, advertising and analytics data.',
  alternates: { canonical: `${getSiteUrl()}/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="14 November 2026">
      <p>
        This policy explains what information AirScope India (&ldquo;we&rdquo;, &ldquo;the site&rdquo;) handles when you use{' '}
        {getSiteUrl()}. We do not require an account and we do not sell personal information.
      </p>
      <h2>Location</h2>
      <p>
        If you tap &ldquo;Use my location&rdquo; your browser asks for permission. If you allow it, your approximate coordinates
        are sent to our server once to find the nearest air quality station or model estimate. We do not store them and do not
        link them to you. You can refuse and search for a place instead.
      </p>
      <h2>Search</h2>
      <p>
        When you type a place name that is not in our built-in list, the text is sent to a public geocoding service (Photon by
        Komoot, based on OpenStreetMap) to find its coordinates. Reverse lookups of your GPS position use the same kind of service.
      </p>
      <h2>Data stored on your device</h2>
      <p>
        We use your browser&rsquo;s local storage to remember your favourite stations and whether you answered the location
        prompt. This stays on your device and you can clear it from your browser settings.
      </p>
      <h2>Advertising and cookies</h2>
      <p>
        We may show ads from Google AdSense. Google and its partners may use cookies or similar technologies to serve and measure
        ads, including personalised ads based on your visits to this and other sites. You can manage personalised advertising at{' '}
        <a href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">Google Ads Settings</a> and learn how Google
        uses data at{' '}
        <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">policies.google.com/technologies/partner-sites</a>.
        Where required by law (for example for visitors in the European Economic Area, United Kingdom and Switzerland) we ask for
        consent before personalised ads or non-essential cookies are used.
      </p>
      <h2>Affiliate links</h2>
      <p>
        Some product links (for example on Amazon) are affiliate links. If you buy through them we may earn a commission at no extra
        cost to you. The retailer sets its own cookies when you follow a link.
      </p>
      <h2>Analytics and server logs</h2>
      <p>
        Our hosting provider (Render) records standard server logs such as IP address, time and requested URL for security and
        reliability. If we enable analytics it will be a privacy-focused tool and will be described here.
      </p>
      <h2>Third parties we load or call</h2>
      <ul>
        <li>CARTO and OpenStreetMap: map tiles</li>
        <li>data.gov.in, OpenAQ and Open-Meteo: air quality data (called from our server, not your browser)</li>
        <li>Photon (Komoot): place search</li>
        <li>Google AdSense: advertising, when enabled</li>
      </ul>
      <h2>Children</h2>
      <p>The site is a general information service and is not directed at children under 13.</p>
      <h2>Your choices and contact</h2>
      <p>
        To ask a privacy question or request deletion of anything you have sent us, email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We may update this policy and will change the date above when we do.
      </p>
    </LegalPage>
  );
}
