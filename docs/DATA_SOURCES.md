# AirScope India — Data Sources, Licensing & Verification

## 1. Primary Data Source: Central Pollution Control Board (CPCB)

AirScope India utilizes the official real-time ambient air quality dataset published by the **Central Pollution Control Board (CPCB)**, under the Ministry of Environment, Forest and Climate Change (MoEFCC), Government of India.

### 1.1 Technical Specifications

| Parameter | Official Specification |
| :--- | :--- |
| **Catalog Title** | Real-time Air Quality Index from various locations |
| **Publishing Agency** | Central Pollution Control Board (CPCB) / MoEFCC |
| **OGD Resource ID** | `3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69` |
| **Base API Endpoint** | `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69` |
| **Authentication** | Free developer API Key obtained via `data.gov.in` user profile |
| **Supported Formats** | JSON, XML, CSV |
| **Update Frequency** | Hourly (continuous automated telemetry) |
| **Response Schema** | Per-pollutant records containing: `country`, `state`, `city`, `station`, `last_update`, `pollutant_id`, `pollutant_min`, `pollutant_max`, `pollutant_avg`, `pollutant_unit` |

### 1.2 Legal Licensing: Government Open Data License - India (GODL)

The dataset is released under the **Government Open Data License – India (GODL)** pursuant to the National Data Sharing and Accessibility Policy (NDSAP).

#### Commercial Reuse & Monetization Permissions:
- **Full Commercial Freedom**: GODL explicitly grants users a worldwide, royalty-free, perpetual license to use, adapt, publish, translate, display, add value, and create derivative works for **all lawful commercial and non-commercial purposes**.
- **Display on Advertising-Supported Websites**: Permitted without royalty or payment.
- **Affiliate and Commercial Services**: Permitted.

#### Statutory Requirements & Limitations:
1. **Mandatory Attribution**: Applications must visibly acknowledge the data provider, source, and license, including a reference URL to the dataset.
   - *AirScope Implementation*: Permanent attribution is rendered in the global footer, metadata schemas, and individual station inspector cards.
2. **No Implied Endorsement**: The licensee must not indicate or suggest that the Government of India, CPCB, or MoEFCC endorses the application or any commercial product.
   - *AirScope Implementation*: Explicit non-endorsement disclaimer is embedded in legal notices.
3. **Exclusion of Official Emblems**: Government logos, crests, and ministry seals are strictly prohibited from being displayed in commercial branding.
   - *AirScope Implementation*: AirScope uses original, custom SVG iconography.

---

## 2. Secondary / Fallback Source: OpenAQ Platform

OpenAQ is integrated as a secondary verification and fallback source.

### 2.1 Technical Specifications

| Parameter | Specification |
| :--- | :--- |
| **Platform** | OpenAQ API v3 |
| **Base Endpoint** | `https://api.openaq.org/v3/locations` |
| **Authentication** | Header-based: `X-API-Key: <your_key>` |
| **Free Tier Quota** | 60 requests/minute, 2,000 requests/hour |
| **Delhi NCR Bounding Box** | `bbox=76.8,28.2,77.6,28.9` |
| **Licensing** | Open Data Commons Open Database License (ODbL) / individual sensor owner terms |

### 2.2 OpenAQ Commercial Considerations
While OpenAQ aggregates data under open terms, certain underlying station feeds hold specific attribution requirements. AirScope passes through OpenAQ attribution explicitly whenever the fallback provider is activated.

---

## 3. Data Freshness & Staleness Rules

Air monitoring sensors undergo periodic maintenance, calibration flushes, and network transmission latency. AirScope India enforces strict data freshness indicators:

1. **Active Live Telemetry**: Measurements recorded within the past 2 hours ($T_{\text{now}} - T_{\text{reading}} \le 2\text{ hours}$). Rendered with a green `● Live` status badge.
2. **Delayed / Stale Telemetry**: Measurements older than 2 hours ($T_{\text{now}} - T_{\text{reading}} > 2\text{ hours}$). Rendered with a prominent yellow `⚠️ Delayed` warning tag.
3. **Sensor Offline**: If a station is undergoing maintenance or missing data in the current ingestion cycle, it is tagged as `Offline` rather than omitted or replaced with fabricated numbers.

---

## 4. Prohibited Practices

To preserve trust and scientific validity, AirScope India enforces three technical guarantees:
1. **No Fabricated Readings**: If an API key is missing or upstream services are unreachable, production builds render a clear service status or configuration prompt. Test data is confined to isolated developer fixtures.
2. **No Invented Heatmap Interpolations**: Air pollution does not disperse uniformly across complex urban topography. We do not generate fake continuous gradient heatmaps that fabricate values between distant physical stations. Point data represents actual continuous monitors only.
3. **No Unlabeled Standards Mixing**: Indian National AQI (0-500 scale) is never conflated with US EPA AQI (which uses different mathematical concentration breakpoints).
