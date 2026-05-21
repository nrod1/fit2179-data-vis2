# FIT2179 Data Visualisation 2 — Australia Tourism Economy

**Author:** [Your Name]  
**Unit:** FIT2179 Data Visualisation, Monash University  
**Semester:** Semester 1, 2026  
**Due:** 29 May 2026

---

## 🚀 GitHub Pages Setup (CRITICAL — do this first)

### Step 1: Create a GitHub repository

1. Go to [github.com](https://github.com) and log in
2. Click **New repository**
3. Name it exactly: `fit2179-data-vis2`
4. Make it **Public**
5. Do NOT initialise with a README (you already have this one)
6. Click **Create repository**

### Step 2: Push your code to GitHub

Open a terminal in your project folder (`fit2179 data vis 2/`) and run:

```bash
git init
git add .
git commit -m "Initial commit: FIT2179 Data Vis 2 - Australia Tourism"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fit2179-data-vis2.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch, **/ (root)** folder
5. Click **Save**
6. Wait ~2 minutes, then visit: `https://YOUR_USERNAME.github.io/fit2179-data-vis2/`

### Step 4: Update the data URL in main.js

Open `js/main.js` and on line 12, change:
```js
const DATA_BASE = "https://raw.githubusercontent.com/YOUR_USERNAME/fit2179-data-vis2/main/data/";
```
to use your actual GitHub username:
```js
const DATA_BASE = "https://raw.githubusercontent.com/johndoe/fit2179-data-vis2/main/data/";
```

Then commit and push again:
```bash
git add js/main.js
git commit -m "Fix data URL with correct GitHub username"
git push
```

---

## 📁 Repository Structure

```
fit2179-data-vis2/
├── index.html              ← Main webpage
├── css/
│   └── style.css           ← Styling (cyan background, fonts)
├── js/
│   └── main.js             ← All 12 Vega-Lite chart specs
├── data/
│   ├── australia_states_simple.topojson   ← Australian state boundaries
│   ├── businesses_by_state.csv
│   ├── businesses_trend.csv
│   ├── domestic_vs_intl.csv
│   ├── gdp_by_visitor_type.csv
│   ├── intl_visitor_consumption.csv
│   ├── jobs_by_industry_2024.csv
│   ├── jobs_trend.csv
│   ├── output_by_industry.csv
│   └── tourism_gdp.csv
└── README.md
```

---

## 📊 Visualisations (12 total)

| # | Chart Type | What it Shows |
|---|-----------|---------------|
| 1 | **Choropleth Map** | Tourism businesses by state (colour encoded) |
| 2 | **Proportional Symbol Map** | Tourism businesses by state (circle size) |
| 3 | **Area Chart + Annotation** | Tourism GDP trend 2016–25 with COVID marker |
| 4 | **Grouped Bar Chart** | Domestic vs. international tourism GDP |
| 5 | **Normalised Stacked Area** | Share of GDP by visitor type |
| 6 | **Line + Area Chart** | International visitor consumption trend |
| 7 | **Horizontal Bar Chart** | Jobs by industry (2024–25) |
| 8 | **Horizontal Bar Chart** | Output by industry (2024–25) |
| 9 | **Bubble/Scatter Chart** | Output vs. jobs by industry |
| 10 | **Stacked Bar Chart** | Businesses by type over time |
| 11 | **Line + Area Chart** | Total tourism employment trend |
| 12 | **Donut / Arc Chart** | Characteristic vs. connected business split |

---

## 📚 Data Sources

1. **ABS Tourism Satellite Account, 2024–25**  
   Released 17 December 2025  
   https://www.abs.gov.au/statistics/industry/tourism-and-hospitality/tourism-satellite-account/2024-25

2. **ABS Tourism Research Australia — Business Register, 2025**  
   https://www.abs.gov.au/statistics/industry/tourism-and-hospitality/tourism-research-australia/2025

3. **Australian States GeoJSON** (Rowan Hogan, CC0)  
   https://github.com/rowanhogan/australian-states

---

## 🤖 AI Acknowledgement

Claude (Anthropic) was used to:
- Assist in extracting and cleaning data from ABS Excel files
- Generate scaffolding for Vega-Lite JSON specifications
- Draft and refine narrative text

All design decisions, chart choices, and final content were directed and reviewed by the author.

---

## ✏️ Moodle Submission Checklist

- [ ] GitHub Pages URL is publicly accessible
- [ ] All Vega-Lite JSON is readable in the repository
- [ ] At least one geographic map included ✓ (choropleth + symbol map)
- [ ] Minimum 10 visualisations ✓ (12 included)
- [ ] Multiple different idioms ✓
- [ ] Data from 2 sources ✓ (ABS TSA + ABS Business Register)
- [ ] Author name and date on the page ✓
- [ ] Data sources cited ✓
- [ ] AI use acknowledged ✓
- [ ] 500-word Moodle description submitted
- [ ] Sketch PDF uploaded to GitHub and URL submitted
