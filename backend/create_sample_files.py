import os
import json
import fitz  # PyMuPDF
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from database import (
    init_db, SessionLocal, Project, DocumentRecord, CitationIssueRecord,
    SavedSourceRecord, LiteratureReviewRecord, AuditLogRecord
)
from services.document_processor import DocumentProcessor
from services.structure_detector import StructureDetector
from services.citation_extractor import CitationExtractor
from services.citation_auditor import CitationAuditor

SAMPLE_TEXT = """Title: Automated Verification of Scholarly Citations and Reference Integrity in Academic Publishing

Abstract
Academic referencing integrity is foundational to scholarly communication and empirical reproducibility. However, manual proofreading frequently fails to detect subtle discrepancies between in-text citations and bibliographic lists. In this study, we evaluate automated algorithmic methods for identifying citation anomalies across peer-reviewed manuscripts.

1. Introduction
Scholarly literature discovery has evolved dramatically with the integration of neural representations and modern bibliometrics (Vaswani et al., 2021). Despite automated search advancements, contemporary publishing environments continue to suffer from pervasive referencing errors (Sharma, 2022).
Furthermore, recent investigations by Smyth et al. (2021) observed that bibliographic inaccuracies can degrade automated citation graphs and citation rankings.
Prior empirical studies have demonstrated that over 40% of published manuscripts contain referencing defects.
In related contexts, Martinez (2020) highlighted that author name disambiguation remains an acute bottleneck.
Additionally, Brown et al. (2023) examined collaborative multi-author citations across high-impact journals.

2. Literature Review
The theoretical foundations of citation analysis trace back to foundational information science paradigms. When comparing algorithmic parsers against manual human evaluation, early studies identified high variability in boundary detection. More recent work has attempted to resolve author-date ambiguity using fuzzy string matching and digital object identifier verification.

3. Research Methodology
We developed a deterministic multi-stage verification framework. First, manuscripts are segmented into structural academic sections using hierarchical heading heuristics. Second, regular expression engines extract both parenthetical and narrative in-text citations. Third, reference entries are parsed into structured entities containing authors, publication years, titles, and DOIs.

4. Results & Discussion
Our experimental findings indicate that deterministic matching resolves 92% of standard author-date citations with high confidence. The remaining ambiguities primarily originate from transliteration variations, missing publication dates, or broken DOIs.

5. Conclusion
Automated citation auditing provides an essential safeguard for academic publishers, peer reviewers, and researchers, drastically reducing referencing defects prior to final camera-ready publication.

References
[1] Vaswani, A., & Shazeer, N. (2021). Attention mechanisms in deep neural networks. Advances in Neural Information Processing Systems. https://doi.org/10.5555/3295222.3295349
[2] Smith, J. (2021). Natural language architectures in bibliometrics. Artificial Intelligence Review. https://doi.org/10.1007/s10462-021-09999-x
[3] Martinez, R. (2022). Longitudinal analysis of citation inaccuracies in scholarly publishing. Journal of Informetrics. https://doi.org/10.1016/j.joi.2022.101284
[4] Brown, K., & Taylor, S. (2023). Collaborative multi-author citation patterns in computational sciences. Quantitative Science Studies. https://doi.org/10.1162/qss_a_00112
[5] Uncited, R. (2023). Neglected scholarly work in contemporary bibliometric indexes. Scientometrics. https://doi.org/10.1007/s11192-023-04567-x
[6] Broken, D. (2022). Malformed identifiers in open access repositories. Library Trends. doi: malformed-doi-xyz
"""

def create_sample_docx(file_path: str):
    doc = Document()
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    lines = SAMPLE_TEXT.strip().split("\n")
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        if line_clean.startswith("Title:"):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(line_clean.replace("Title:", "").strip())
            run.font.name = "Times New Roman"
            run.font.size = Pt(16)
            run.font.bold = True
        elif line_clean in ["Abstract", "1. Introduction", "2. Literature Review", "3. Research Methodology", "4. Results & Discussion", "5. Conclusion", "References"]:
            h = doc.add_heading(line_clean, level=1)
            h.paragraph_format.space_before = Pt(12)
            h.paragraph_format.space_after = Pt(4)
        else:
            p = doc.add_paragraph()
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(line_clean)
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)

    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    doc.save(file_path)
    print(f"Created DOCX: {file_path}")

def create_sample_pdf(file_path: str):
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)  # Standard Letter size
    y = 54
    lines = SAMPLE_TEXT.strip().split("\n")
    for line in lines:
        if not line.strip():
            y += 12
            continue
        if y > 730:
            page = doc.new_page(width=612, height=792)
            y = 54
        is_heading = any(line.strip().startswith(h) for h in ["Title:", "Abstract", "1.", "2.", "3.", "4.", "5.", "References"])
        font_size = 14 if line.strip().startswith("Title:") else (12 if is_heading else 10)
        page.insert_text((54, y), line.strip(), fontsize=font_size)
        y += font_size + 6

    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    doc.save(file_path)
    doc.close()
    print(f"Created PDF: {file_path}")

def seed_database():
    init_db()
    db = SessionLocal()

    # Create uploads directory and sample files
    sample_dir = os.path.abspath("./samples")
    os.makedirs(sample_dir, exist_ok=True)
    docx_file = os.path.join(sample_dir, "sample_academic_paper.docx")
    pdf_file = os.path.join(sample_dir, "sample_academic_paper.pdf")

    create_sample_docx(docx_file)
    create_sample_pdf(pdf_file)

    # 1. Seed Project 1: Citation Auditor with the sample PDF
    existing_p1 = db.query(Project).filter(Project.title.like("%Automated Verification%")).first()
    if not existing_p1:
        p1 = Project(
            title="Automated Verification of Scholarly Citations and Reference Integrity",
            mode="citation_auditor",
            status="audited",
            target_journal="Journal of Informetrics",
            citation_style="APA 7th"
        )
        db.add(p1)
        db.commit()
        db.refresh(p1)

        # Process document
        extracted = DocumentProcessor.process_document(pdf_file)
        pages = extracted["pages"]
        full_text = extracted["full_text"]
        toc = StructureDetector.detect_sections(pages, full_text)
        split = StructureDetector.extract_reference_section_text(pages, full_text)
        cits = CitationExtractor.extract_in_text_citations(split["body_text"], pages)
        refs = CitationExtractor.extract_references_list(split["reference_text"])
        issues = CitationAuditor.audit_document(cits, refs, split["body_text"], pages)

        doc_rec = DocumentRecord(
            project_id=p1.id,
            filename="sample_academic_paper.pdf",
            file_type="pdf",
            file_path=pdf_file,
            page_count=extracted["page_count"],
            word_count=extracted["word_count"],
            structure_json=json.dumps(toc),
            extracted_text=full_text
        )
        db.add(doc_rec)
        db.commit()
        db.refresh(doc_rec)

        for iss in issues:
            rec = CitationIssueRecord(
                project_id=p1.id,
                document_id=doc_rec.id,
                category=iss["category"],
                severity=iss["severity"],
                status="open",
                cited_text=iss["cited_text"],
                author=iss.get("author"),
                year=str(iss.get("year")) if iss.get("year") else None,
                page=iss.get("page", 1),
                paragraph=iss.get("paragraph", 1),
                confidence=iss.get("confidence", 1.0),
                explanation=iss["explanation"],
                suggested_correction=iss.get("suggested_correction"),
                verified_source=json.dumps(iss.get("verified_source")) if iss.get("verified_source") else None
            )
            db.add(rec)

        db.add(AuditLogRecord(
            project_id=p1.id,
            action_type="initial_seed",
            description=f"Loaded and audited benchmark sample paper with {len(issues)} citation issues."
        ))
        db.commit()
        print(f"Seeded Project 1 (Citation Auditor) with {len(issues)} detected issues.")

    # 2. Seed Project 2: Literature Review with synthesized sections & verified OpenAlex works
    existing_p2 = db.query(Project).filter(Project.title.like("%Retrieval-Augmented%")).first()
    if not existing_p2:
        p2 = Project(
            title="Retrieval-Augmented Generation for Scientific Hypothesis Formulation",
            mode="literature_review",
            status="completed",
            target_journal="Nature Artificial Intelligence",
            citation_style="APA 7th"
        )
        db.add(p2)
        db.commit()
        db.refresh(p2)

        sections = [
            {
                "section_number": 1,
                "title": "Theoretical Foundations of Retrieval-Augmented Scientific Reasoning",
                "content": "The emergence of Retrieval-Augmented Generation (RAG) marks a pivotal paradigm shift in automated literature synthesis. Vaswani et al. (2021) established the computational foundation of self-attention architectures, demonstrating that global cross-attention mechanisms efficiently encode intricate dependency graphs. In scientific contexts, however, static parameter weights suffer from catastrophic hallucination when exposed to fine-grained empirical data. Gao et al. (2024) formulated an integrated retrieval-generation framework that dynamically grounds inference by pulling verified external vectors from indexed scientific corpora.",
                "sources_cited": ["Attention Is All You Need", "A Survey on Retrieval-Augmented Generation"]
            },
            {
                "section_number": 2,
                "title": "Contemporary Empirical Evidence and Comparative Benchmarks",
                "content": "Recent empirical studies published between 2022 and 2025 validate that dynamic retrieval markedly mitigates factual degradation across biomedical and mathematical benchmarks. Wang et al. (2023) evaluated generative models across 1,200 scientific discovery pipelines, reporting a 37% improvement in bibliographic precision when hybrid dense-sparse retrieval was utilized. Conversely, Sharma et al. (2022) observed that ungrounded models frequently generate plausible-sounding yet completely fabricated digital object identifiers, reinforcing the urgent imperative for automated citation verification prior to manuscript submission.",
                "sources_cited": ["Scientific Discovery in the Age of Generative AI", "Citation Inconsistencies and Referencing Accuracy"]
            },
            {
                "section_number": 3,
                "title": "Methodological Divergence, Conflicting Findings, and Research Limitations",
                "content": "Despite promising empirical results, existing literature exhibits non-trivial methodological divergence regarding optimal chunking strategies and semantic reranking. Visser et al. (2021) demonstrated that open metadata providers (Crossref, OpenAlex) differ substantially in coverage depth and citation linkage latency compared to proprietary databases like Scopus. Consequently, systems trained exclusively on single-provider indexes risk systematic coverage bias, particularly across non-English and regional scholarly journals.",
                "sources_cited": ["Systematic Evaluation of Open Scholarly Metadata"]
            }
        ]

        gaps = [
            {
                "gap_title": "Lack of Multi-Repository Disambiguation Benchmarks",
                "description": "Current literature predominantly evaluates retrieval accuracy on isolated datasets rather than federated multi-registry environments.",
                "supporting_evidence": "Demonstrated across Visser et al. (2021) and Gao et al. (2024)."
            },
            {
                "gap_title": "Absence of Longitudinal Tracking for Outdated Scholarly Claims",
                "description": "Generative models lack temporal decay mechanisms to deprecate retracted or obsolete scientific claims automatically.",
                "supporting_evidence": "Highlighted as a critical bottleneck in Wang et al. (2023)."
            }
        ]

        references = [
            "Gao, Y., Xiong, Y., Gao, X., Jia, K., & Pan, J. (2024). A Survey on Retrieval-Augmented Generation for Large Language Models. IEEE Transactions on Knowledge and Data Engineering. https://doi.org/10.1109/TKDE.2024.3364789",
            "Sharma, P., Martinez, R., & Henderson, C. (2022). Citation Inconsistencies and Referencing Accuracy in Contemporary Academic Publishing. Journal of Informetrics. https://doi.org/10.1016/j.joi.2022.101284",
            "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., & Jones, L. (2021). Attention Is All You Need: Architectural Advancements. Advances in Neural Information Processing Systems. https://doi.org/10.5555/3295222.3295349",
            "Visser, M., van Eck, N. J., & Waltman, L. (2021). Systematic Evaluation of Open Scholarly Metadata: Crossref, OpenAlex, and Scopus Comparison. Quantitative Science Studies. https://doi.org/10.1162/qss_a_00112",
            "Wang, H., Fu, T., Du, Y., Gao, W., & Huang, K. (2023). Scientific Discovery in the Age of Generative AI: Opportunities and Methodological Challenges. Nature Artificial Intelligence. https://doi.org/10.1038/s42256-023-00712-4"
        ]

        rev_rec = LiteratureReviewRecord(
            project_id=p2.id,
            title=p2.title,
            domain="Artificial Intelligence & Computer Science",
            target_journal=p2.target_journal,
            citation_style=p2.citation_style,
            sections_json=json.dumps(sections),
            gaps_json=json.dumps(gaps),
            references_json=json.dumps(references),
            word_count=sum(len(s["content"].split()) for s in sections)
        )
        db.add(rev_rec)

        # Seed saved sources
        for ref_str in references:
            db.add(SavedSourceRecord(
                project_id=p2.id,
                title=ref_str.split(". ")[1] if len(ref_str.split(". ")) > 1 else ref_str,
                authors=ref_str.split(" (")[0],
                year=2023,
                journal="Peer-Reviewed Scholarly Venue",
                citation_count=184,
                citation_source="OpenAlex",
                verification_status="verified",
                relevance_score=0.94,
                quartile="Q1"
            ))

        db.add(AuditLogRecord(
            project_id=p2.id,
            action_type="review_seeded",
            description="Seeded benchmark Literature Review with 3 thematic sections and 5 verified references."
        ))
        db.commit()
        print("Seeded Project 2 (Literature Review) successfully.")

    db.close()

if __name__ == "__main__":
    seed_database()
