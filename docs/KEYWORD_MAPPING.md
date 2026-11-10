# AirScope India — Keyword to URL Mapping Matrix

This keyword architecture prevents keyword cannibalization by assigning distinct search queries to dedicated landing pages.

---

## 1. Primary Commercial & Immediate Queries

| Primary Keyword | Secondary / Variant Queries | Target URL | Page Intent | Search Volume Class |
|---|---|---|---|---|
| **Delhi AQI** | Delhi AQI live, Delhi air quality index, AQI Delhi | `/` (Homepage) | Real-time immediate lookup | High (Peak Winter) |
| **Delhi AQI today** | Today Delhi pollution level, current AQI Delhi | `/` (Homepage) | Real-time immediate lookup | High |
| **Delhi pollution live** | Live pollution map Delhi, Delhi NCR smog today | `/` (Homepage) | Geospatial / 3D map | Moderate to High |
| **AQI near me** | Air quality near my location, closest AQI station | `/` (with Geolocation) | Proximity search | High (Mobile) |

---

## 2. Regional City Landing Pages

| Target City | Primary Target Keywords | Target URL | Secondary Keywords |
|---|---|---|---|
| **Delhi (All)** | Delhi air quality, Delhi CAAQMS stations, DPCC air quality | `/delhi` | Delhi pollution stations, Delhi PM2.5 live |
| **Noida** | Noida AQI today, Noida air quality live, UPPCB Noida | `/noida` | Greater Noida AQI, Expressway pollution |
| **Gurugram** | Gurugram AQI today, Gurgaon air quality, Cyber City AQI | `/gurugram` | Vikas Sadan AQI, HSPCB Gurugram |
| **Ghaziabad** | Ghaziabad AQI today, Indirapuram AQI, Vasundhara air quality | `/ghaziabad` | Loni AQI today, GT Road pollution |
| **Faridabad** | Faridabad AQI today, Faridabad pollution levels | `/faridabad` | Sector 16A Faridabad AQI, Mathura Road air |

---

## 3. Hyperlocal CAAQMS Station Pages (Delhi Localities)

| Station / Locality | Primary Target Keyword | Target URL | Station Agency |
|---|---|---|---|
| **Anand Vihar** | Anand Vihar AQI today | `/delhi/anand-vihar` | DPCC (East Delhi) |
| **Dwarka** | Dwarka AQI today, Dwarka Sector 8 air quality | `/delhi/dwarka` | DPCC (South West Delhi) |
| **Rohini** | Rohini AQI today, Rohini Sector 16 air quality | `/delhi/rohini` | DPCC (North West Delhi) |
| **ITO** | ITO AQI today, ITO Delhi air quality live | `/delhi/ito` | CPCB (Central Delhi) |
| **Ashok Vihar** | Ashok Vihar AQI, Satyawati College station | `/delhi/ashok-vihar` | DPCC (North West Delhi) |
| **Bawana** | Bawana AQI, Bawana industrial air quality | `/delhi/bawana` | DPCC (North West Delhi) |
| **Mandir Marg** | Mandir Marg AQI today, New Delhi air quality | `/delhi/mandir-marg` | DPCC (Central Delhi) |
| **Punjabi Bagh** | Punjabi Bagh AQI today, West Delhi air quality | `/delhi/punjabi-bagh` | DPCC (West Delhi) |
| **R.K. Puram** | RK Puram AQI today, South Delhi pollution | `/delhi/rk-puram` | DPCC (South West Delhi) |
| **Jahangirpuri** | Jahangirpuri AQI today, North Delhi pollution | `/delhi/jahangirpuri` | DPCC (North West Delhi) |
| **Okhla Phase II** | Okhla AQI today, South Delhi industrial air | `/delhi/okhla` | DPCC (South Delhi) |
| **Sonia Vihar** | Sonia Vihar AQI, North East Delhi pollution | `/delhi/sonia-vihar` | DPCC (North East Delhi) |
| **Patparganj** | Patparganj AQI today, East Delhi air quality | `/delhi/patparganj` | DPCC (East Delhi) |
| **Vivek Vihar** | Vivek Vihar AQI, Shahdara air quality | `/delhi/vivek-vihar` | DPCC (East Delhi) |
| **Wazirpur** | Wazirpur AQI today, Wazirpur industrial area | `/delhi/wazirpur` | DPCC (North Delhi) |
| **Narela** | Narela AQI today, North Delhi CAAQMS | `/delhi/narela` | DPCC (North Delhi) |
| **Burari Crossing** | Burari AQI today, Outer Ring Road air quality | `/delhi/burari-crossing` | DPCC (North Delhi) |

---

## 4. Hyperlocal CAAQMS Station Pages (Noida Localities)

| Station / Locality | Primary Target Keyword | Target URL | Agency |
|---|---|---|---|
| **Sector 62, Noida** | Sector 62 Noida AQI today | `/noida/noida-sector-62` | CPCB / IMD |
| **Sector 125, Noida** | Sector 125 Noida AQI, Expressway air quality | `/noida/noida-sector-125` | UPPCB |
| **Sector 1, Noida** | Sector 1 Noida AQI today, Industrial area | `/noida/noida-sector-1` | UPPCB |

---

## 5. Knowledge Centre (Informational Queries)

| Target Query | Search Intent | Target URL | Featured Schema |
|---|---|---|---|
| **What is AQI?** | High-level educational introduction | `/learn/what-is-aqi` | `Article`, `BreadcrumbList` |
| **PM2.5 vs PM10** | Scientific comparison of particulate matter | `/learn/pm25-vs-pm10` | `Article`, `BreadcrumbList` |
| **Indian AQI categories** | Understanding Good, Moderate, Severe bands | `/learn/indian-aqi-categories` | `Article`, `BreadcrumbList` |
| **How AQI is calculated in India** | Formula, CPCB breakpoints, sub-indices | `/learn/how-aqi-is-calculated` | `Article`, `BreadcrumbList` |
| **Air pollution health effects** | Masks, respiratory risks, HEPA filters | `/learn/air-pollution-health-effects` | `Article`, `BreadcrumbList` |
| **How to read AQI** | Practical daily lifestyle guidance | `/learn/how-to-read-aqi` | `Article`, `BreadcrumbList` |
| **Why is Delhi polluted in winter?** | Weather inversion, stubble burning, IGP basin | `/learn/delhi-pollution-guide` | `Article`, `BreadcrumbList` |
