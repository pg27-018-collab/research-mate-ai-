# ResearchMate AI
### AI-Powered Academic Research Assistant, Citation Auditor & Literature Review Generator

**ResearchMate AI** is a production-oriented web platform engineered for researchers, professors, doctoral students, and academic writers. It provides automated citation verification, bibliometric anomaly detection, real-world scholarly discovery via OpenAlex and Crossref registries, and structured literature review synthesis with traceable citations.

---

## 🌟 Key Architecture & Capabilities

### 1. Mode A: Citation Auditor
- **Document Ingestion**: Supports `.pdf` and `.docx` manuscripts with coordinate-aware block extraction via **PyMuPDF** (`fitz`) and **python-docx**.
- **Document Structure Detection**: Automatically recognizes standard academic sections (*Abstract, Introduction, Literature Review, Methodology, Results & Discussion, Conclusion, References*) and generates a numbered, interactive Table of Contents.
- **Deterministic Citation Matching Engine**:
  - **Category 1 (Missing Reference)**: Detects in-text citations (e.g. `(Sharma, 2022)`) that lack corresponding entries in the bibliography.
  - **Category 2 (Uncited Reference)**: Identifies bibliographic entries in the reference list that are never cited in the body text.
  - **Category 3 (Inconsistent / Typo Citations)**: Flags author spelling discrepancies (e.g. `Smyth` vs `Smith`), publication year mismatches, broken/malformed DOIs, duplicate entries, and *et al.* misuse.
  - **Unsupported Claim Detection**: Surfaces empirical statements or statistical assertions lacking peer-reviewed grounding.
- **Interactive 3-Panel Split Workspace**:
  - **Left Panel**: Academic structure navigator (TOC) and searchable issue list with filters (Category, Severity, Status).
  - **Center Panel**: Manuscript viewer with highlighted text spans, zoom controls, and page/issue jump buttons.
  - **Right Panel**: Issue Inspector displaying confidence score, academic explanation, suggested corrections, and one-click resolution.

### 2. Mode B: Literature Review Generator
- **Scholarly Literature Discovery**: Live integration with **OpenAlex API** and **Crossref API** prioritizing contemporary peer-reviewed research (post-2020).
- **Bibliographic Source Verification**: Retrieves real article titles, authors, DOIs, publisher URLs, abstracts, and verified citation counts.
- **Scopus & CiteScore Journal Inspector**: Checks journal ISSNs, active indexing status, and CiteScore quartiles (Q1–Q4) with 2-year mean citedness telemetry.
- **Thematic Synthesis**: Generates at least three dynamically-adapted thematic sections synthesizing multiple papers rather than summarizing them in isolation.
- **Identified Research Gaps**: Pinpoints grounded, literature-backed research limitations (e.g. absence of longitudinal studies, conflicting empirical benchmarks).
- **Cross-Mode Bridge**: One-click transfer of generated literature reviews into the **Citation Auditor** for complete self-auditing!

### 3. Export Center
- Export literature reviews to **DOCX** with academic formatting (1-inch margins, Times New Roman, indented citations, reference lists).
- Export formal **Citation Audit Reports** summarizing detected defects, locations, and corrections.
- Export clean **BibTeX** (`.bib`) files.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React icons.
- **Backend**: Python 3, FastAPI, Pydantic, SQLAlchemy, Uvicorn.
- **Document Processing**: PyMuPDF (`fitz`), python-docx.
- **Database**: SQLite (SQLModel/SQLAlchemy modular architecture ready for PostgreSQL).
- **Scholarly APIs**: OpenAlex REST API, Crossref Works Registry.

---

## 🚀 Quick Start Guide

### One-Click Launch
Run the provided launcher script to start both the backend and frontend concurrently:
```bash
./start.sh
```
- **Web Interface**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Documentation & Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Manual Start

#### 1. Backend Server
```bash
cd backend
# Activate virtual environment
source venv/bin/activate

# Seed sample data (creates benchmark sample papers & initial projects)
PYTHONPATH=. python3 create_sample_files.py

# Start FastAPI server
PYTHONPATH=. uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Application
```bash
cd frontend
npm run dev
```

---

## 🧪 Running Automated Tests

Run the automated test suite verifying citation extraction, structure detection, and audit categorization:
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest tests/ -v
```

---

## 📄 Benchmark Test Papers
Two sample manuscripts are available in `backend/samples/`:
1. `sample_academic_paper.pdf`: Contains realistic academic text and intentional benchmark citation defects for instant audit testing.
2. `sample_academic_paper.docx`: Microsoft Word format equivalent.
