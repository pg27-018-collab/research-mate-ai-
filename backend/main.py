import os
import shutil
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import (
    init_db, get_db, Project, DocumentRecord, CitationIssueRecord,
    SavedSourceRecord, LiteratureReviewRecord, AuditLogRecord
)
from services.document_processor import DocumentProcessor
from services.structure_detector import StructureDetector
from services.citation_extractor import CitationExtractor
from services.citation_auditor import CitationAuditor
from services.scholarly_service import ScholarlyService
from services.lit_review_generator import LiteratureReviewGenerator
from services.export_service import ExportService

# Initialize FastAPI application
app = FastAPI(
    title="ResearchMate AI API",
    description="Academic Research Assistant, Citation Auditor & Literature Review Generator",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.abspath("./uploads")
EXPORT_DIR = os.path.abspath("./exports")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)

# Initialize database tables on startup
@app.on_event("startup")
def startup_event():
    init_db()

# --- Request / Response Models ---
class ProjectCreate(BaseModel):
    title: str
    mode: str = "citation_auditor"  # 'citation_auditor' or 'literature_review'
    target_journal: Optional[str] = None
    citation_style: str = "APA 7th"

class IssueUpdate(BaseModel):
    status: Optional[str] = None  # 'open', 'reviewing', 'resolved', 'dismissed'
    cited_text: Optional[str] = None
    suggested_correction: Optional[str] = None

class ScholarlySearchQuery(BaseModel):
    query: str
    start_year: int = 2020
    end_year: int = 2026
    limit: int = 15

class JournalInspectQuery(BaseModel):
    journal_name: str

class LitReviewRequest(BaseModel):
    project_id: Optional[int] = None
    title: str
    domain: Optional[str] = "Computer Science and Information Systems"
    research_questions: Optional[str] = None
    target_journal: Optional[str] = None
    citation_style: str = "APA 7th"
    desired_sources_count: int = 8
    min_thematic_sections: int = 3
    sources: Optional[List[Dict[str, Any]]] = None

class SaveSourceRequest(BaseModel):
    project_id: Optional[int] = None
    title: str
    authors: Optional[str] = None
    year: Optional[int] = None
    journal: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    citation_count: int = 0
    citation_source: str = "OpenAlex"
    abstract: Optional[str] = None
    verification_status: str = "verified"
    quartile: Optional[str] = "Q1"

# --- Dashboard & Project Endpoints ---
@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    total_issues = db.query(CitationIssueRecord).count()
    resolved_issues = db.query(CitationIssueRecord).filter(CitationIssueRecord.status == "resolved").count()
    total_reviews = db.query(LiteratureReviewRecord).count()
    total_sources = db.query(SavedSourceRecord).count()

    recent_projects = db.query(Project).order_by(Project.created_at.desc()).limit(5).all()
    recent_activity = db.query(AuditLogRecord).order_by(AuditLogRecord.created_at.desc()).limit(6).all()

    return {
        "total_projects": total_projects,
        "citation_issues_detected": total_issues,
        "issues_resolved": resolved_issues,
        "literature_reviews_generated": total_reviews,
        "saved_sources_count": total_sources,
        "recent_projects": [
            {
                "id": p.id,
                "title": p.title,
                "mode": p.mode,
                "status": p.status,
                "citation_style": p.citation_style,
                "created_at": p.created_at.isoformat()
            }
            for p in recent_projects
        ],
        "recent_activity": [
            {
                "id": a.id,
                "action_type": a.action_type,
                "description": a.description,
                "created_at": a.created_at.isoformat()
            }
            for a in recent_activity
        ]
    }

@app.get("/api/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    result = []
    for p in projects:
        doc = db.query(DocumentRecord).filter(DocumentRecord.project_id == p.id).first()
        issue_count = db.query(CitationIssueRecord).filter(CitationIssueRecord.project_id == p.id).count()
        open_issues = db.query(CitationIssueRecord).filter(
            CitationIssueRecord.project_id == p.id,
            CitationIssueRecord.status.in_(["open", "reviewing"])
        ).count()
        has_review = db.query(LiteratureReviewRecord).filter(LiteratureReviewRecord.project_id == p.id).first() is not None

        result.append({
            "id": p.id,
            "title": p.title,
            "mode": p.mode,
            "status": p.status,
            "target_journal": p.target_journal,
            "citation_style": p.citation_style,
            "created_at": p.created_at.isoformat(),
            "has_document": doc is not None,
            "doc_filename": doc.filename if doc else None,
            "total_issues": issue_count,
            "open_issues": open_issues,
            "has_review": has_review
        })
    return result

@app.post("/api/projects")
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        title=data.title,
        mode=data.mode,
        target_journal=data.target_journal,
        citation_style=data.citation_style,
        status="active"
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    log = AuditLogRecord(
        project_id=project.id,
        action_type="project_created",
        description=f"Project '{project.title}' initialized in {project.mode.replace('_', ' ').title()} mode."
    )
    db.add(log)
    db.commit()

    return {"id": project.id, "title": project.title, "mode": project.mode, "status": project.status}

@app.get("/api/projects/{project_id}")
def get_project_details(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    document = db.query(DocumentRecord).filter(DocumentRecord.project_id == project_id).first()
    issues = db.query(CitationIssueRecord).filter(CitationIssueRecord.project_id == project_id).all()
    review = db.query(LiteratureReviewRecord).filter(LiteratureReviewRecord.project_id == project_id).first()
    sources = db.query(SavedSourceRecord).filter(SavedSourceRecord.project_id == project_id).all()

    doc_data = None
    if document:
        doc_data = {
            "id": document.id,
            "filename": document.filename,
            "file_type": document.file_type,
            "page_count": document.page_count,
            "word_count": document.word_count,
            "structure": json.loads(document.structure_json) if document.structure_json else [],
            "full_text": document.extracted_text
        }

    review_data = None
    if review:
        review_data = {
            "id": review.id,
            "title": review.title,
            "domain": review.domain,
            "target_journal": review.target_journal,
            "citation_style": review.citation_style,
            "sections": json.loads(review.sections_json) if review.sections_json else [],
            "research_gaps": json.loads(review.gaps_json) if review.gaps_json else [],
            "references": json.loads(review.references_json) if review.references_json else [],
            "word_count": review.word_count,
            "created_at": review.created_at.isoformat()
        }

    return {
        "id": project.id,
        "title": project.title,
        "mode": project.mode,
        "status": project.status,
        "target_journal": project.target_journal,
        "citation_style": project.citation_style,
        "created_at": project.created_at.isoformat(),
        "document": doc_data,
        "issues": [
            {
                "id": i.id,
                "category": i.category,
                "severity": i.severity,
                "status": i.status,
                "cited_text": i.cited_text,
                "author": i.author,
                "year": i.year,
                "page": i.page,
                "paragraph": i.paragraph,
                "confidence": i.confidence,
                "explanation": i.explanation,
                "suggested_correction": i.suggested_correction,
                "verified_source": json.loads(i.verified_source) if i.verified_source else None,
                "created_at": i.created_at.isoformat()
            }
            for i in issues
        ],
        "review": review_data,
        "saved_sources": [
            {
                "id": s.id,
                "title": s.title,
                "authors": s.authors,
                "year": s.year,
                "journal": s.journal,
                "doi": s.doi,
                "url": s.url,
                "citation_count": s.citation_count,
                "citation_source": s.citation_source,
                "abstract": s.abstract,
                "verification_status": s.verification_status,
                "relevance_score": s.relevance_score,
                "quartile": s.quartile
            }
            for s in sources
        ]
    }

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

# --- Mode A: Document Upload & Citation Audit Engine ---
@app.post("/api/projects/{project_id}/upload")
async def upload_document_for_audit(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    file_save_path = os.path.join(UPLOAD_DIR, f"{project_id}_{file.filename}")
    with open(file_save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1. Extract Document Content
    extracted = DocumentProcessor.process_document(file_save_path)
    pages = extracted.get("pages", [])
    full_text = extracted.get("full_text", "")

    # 2. Academic Structure Detection & Table of Contents
    toc = StructureDetector.detect_sections(pages, full_text)
    ref_split = StructureDetector.extract_reference_section_text(pages, full_text)
    body_text = ref_split["body_text"]
    reference_text = ref_split["reference_text"]

    # 3. Citation & Reference Extraction
    in_text_citations = CitationExtractor.extract_in_text_citations(body_text, pages)
    ref_start_page = toc[-1]["page"] if toc and toc[-1]["name"] == "References" else len(pages)
    references = CitationExtractor.extract_references_list(reference_text, start_page=ref_start_page)

    # 4. Deterministic Citation Audit
    detected_issues = CitationAuditor.audit_document(in_text_citations, references, body_text, pages)

    # Clear prior documents/issues for clean state
    db.query(CitationIssueRecord).filter(CitationIssueRecord.project_id == project_id).delete()
    db.query(DocumentRecord).filter(DocumentRecord.project_id == project_id).delete()

    # Save Document record
    doc_record = DocumentRecord(
        project_id=project_id,
        filename=file.filename,
        file_type="pdf" if ext == ".pdf" else "docx",
        file_path=file_save_path,
        page_count=extracted["page_count"],
        word_count=extracted["word_count"],
        structure_json=json.dumps(toc),
        extracted_text=full_text
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    # Save Citation Issues
    for iss in detected_issues:
        issue_rec = CitationIssueRecord(
            project_id=project_id,
            document_id=doc_record.id,
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
        db.add(issue_rec)

    # Update project status
    project.status = "audited"
    log = AuditLogRecord(
        project_id=project_id,
        action_type="audit_completed",
        description=f"Audited document '{file.filename}': identified {len(detected_issues)} citation issues across {extracted['page_count']} pages."
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "document_id": doc_record.id,
        "page_count": extracted["page_count"],
        "word_count": extracted["word_count"],
        "table_of_contents": toc,
        "total_citations_extracted": len(in_text_citations),
        "total_references_extracted": len(references),
        "issues_count": len(detected_issues)
    }

@app.patch("/api/issues/{issue_id}")
def update_issue(issue_id: int, data: IssueUpdate, db: Session = Depends(get_db)):
    issue = db.query(CitationIssueRecord).filter(CitationIssueRecord.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if data.status:
        issue.status = data.status
    if data.cited_text:
        issue.cited_text = data.cited_text
    if data.suggested_correction:
        issue.suggested_correction = data.suggested_correction

    log = AuditLogRecord(
        project_id=issue.project_id,
        action_type="issue_updated",
        description=f"Updated citation issue #{issue_id} status to '{issue.status}'."
    )
    db.add(log)
    db.commit()
    return {"message": "Issue updated successfully", "status": issue.status}

# --- Scholarly Search & Scopus Journal Inspector ---
@app.post("/api/scholarly/search")
async def search_scholarly_publications(query: ScholarlySearchQuery):
    works = await ScholarlyService.search_works(
        query=query.query,
        start_year=query.start_year,
        end_year=query.end_year,
        limit=query.limit
    )
    return {"query": query.query, "total": len(works), "results": works}

@app.post("/api/scholarly/verify-doi")
async def verify_doi(payload: Dict[str, str]):
    doi = payload.get("doi")
    if not doi:
        raise HTTPException(status_code=400, detail="DOI required")
    res = await ScholarlyService.verify_doi(doi)
    if not res:
        return {"verified": False, "doi": doi, "message": "DOI could not be resolved in Crossref registry."}
    return res

@app.post("/api/scholarly/inspect-journal")
async def inspect_journal_scopus(data: JournalInspectQuery):
    info = await ScholarlyService.inspect_journal_scopus(data.journal_name)
    return info

# --- Mode B: Literature Review Generator ---
@app.post("/api/lit-review/generate")
async def generate_literature_review(data: LitReviewRequest, db: Session = Depends(get_db)):
    # 1. Discover scholarly publications if not already supplied
    sources = data.sources
    if not sources or len(sources) == 0:
        search_query = f"{data.title} {data.domain or ''}"
        sources = await ScholarlyService.search_works(search_query, start_year=2020, limit=data.desired_sources_count)

    # 2. Synthesize Literature Review with thematic sections & research gaps
    review_output = await LiteratureReviewGenerator.generate_review(
        title=data.title,
        domain=data.domain,
        research_questions=data.research_questions,
        target_journal=data.target_journal,
        citation_style=data.citation_style,
        sources=sources,
        min_sections=data.min_thematic_sections
    )

    # 3. Associate with project
    proj_id = data.project_id
    if not proj_id:
        proj = Project(
            title=data.title,
            mode="literature_review",
            status="completed",
            target_journal=data.target_journal,
            citation_style=data.citation_style
        )
        db.add(proj)
        db.commit()
        db.refresh(proj)
        proj_id = proj.id

    # Save or update review record
    existing_rev = db.query(LiteratureReviewRecord).filter(LiteratureReviewRecord.project_id == proj_id).first()
    if existing_rev:
        existing_rev.title = review_output["title"]
        existing_rev.domain = review_output["domain"]
        existing_rev.target_journal = review_output["target_journal"]
        existing_rev.citation_style = review_output["citation_style"]
        existing_rev.sections_json = json.dumps(review_output["sections"])
        existing_rev.gaps_json = json.dumps(review_output["research_gaps"])
        existing_rev.references_json = json.dumps(review_output["references"])
        existing_rev.word_count = review_output["word_count"]
    else:
        new_rev = LiteratureReviewRecord(
            project_id=proj_id,
            title=review_output["title"],
            domain=review_output["domain"],
            target_journal=review_output["target_journal"],
            citation_style=review_output["citation_style"],
            sections_json=json.dumps(review_output["sections"]),
            gaps_json=json.dumps(review_output["research_gaps"]),
            references_json=json.dumps(review_output["references"]),
            word_count=review_output["word_count"]
        )
        db.add(new_rev)

    # Auto-save verified sources into project library
    for src in sources:
        saved_rec = SavedSourceRecord(
            project_id=proj_id,
            title=src.get("title", ""),
            authors=src.get("authors", ""),
            year=src.get("year"),
            journal=src.get("journal", ""),
            doi=src.get("doi"),
            url=src.get("url"),
            citation_count=src.get("citation_count", 0),
            citation_source=src.get("citation_source", "OpenAlex"),
            abstract=src.get("abstract"),
            verification_status=src.get("verification_status", "verified"),
            relevance_score=src.get("relevance_score", 0.0),
            quartile=src.get("quartile")
        )
        db.add(saved_rec)

    log = AuditLogRecord(
        project_id=proj_id,
        action_type="review_generated",
        description=f"Generated structured literature review with {len(review_output['sections'])} thematic sections and {len(review_output['research_gaps'])} research gaps."
    )
    db.add(log)
    db.commit()

    return {
        "project_id": proj_id,
        "review": review_output,
        "sources_used": sources
    }

# --- Cross-Mode Bridge: Send Literature Review into Citation Auditor ---
@app.post("/api/lit-review/{project_id}/audit-to-project")
def audit_generated_review_as_document(project_id: int, db: Session = Depends(get_db)):
    """
    Renders generated literature review as a document and feeds it directly into
    Mode A (Citation Auditor), ensuring full auditability of AI-generated content.
    """
    review = db.query(LiteratureReviewRecord).filter(LiteratureReviewRecord.project_id == project_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Literature review not found")

    sections = json.loads(review.sections_json) if review.sections_json else []
    references = json.loads(review.references_json) if review.references_json else []

    # Compile document body
    body_parts = [f"Title: {review.title}\n\n"]
    for s in sections:
        body_parts.append(f"{s.get('title')}\n{s.get('content')}\n\n")

    ref_text = "\n".join(references)
    full_text = "".join(body_parts) + "\nReferences\n" + ref_text

    # Generate DOCX
    docx_path = os.path.join(UPLOAD_DIR, f"audit_litreview_{project_id}.docx")
    review_dict = {
        "title": review.title,
        "domain": review.domain,
        "target_journal": review.target_journal,
        "citation_style": review.citation_style,
        "sections": sections,
        "research_gaps": json.loads(review.gaps_json) if review.gaps_json else [],
        "references": references,
        "disclaimer": "Generated by ResearchMate AI - Mode B"
    }
    ExportService.generate_lit_review_docx(review_dict, docx_path)

    # Process via DocumentProcessor & Auditor
    extracted = DocumentProcessor.process_document(docx_path)
    pages = extracted.get("pages", [])
    toc = StructureDetector.detect_sections(pages, full_text)
    ref_split = StructureDetector.extract_reference_section_text(pages, full_text)
    in_text_citations = CitationExtractor.extract_in_text_citations(ref_split["body_text"], pages)
    parsed_refs = CitationExtractor.extract_references_list(ref_split["reference_text"])
    issues = CitationAuditor.audit_document(in_text_citations, parsed_refs, ref_split["body_text"], pages)

    # Update database
    db.query(CitationIssueRecord).filter(CitationIssueRecord.project_id == project_id).delete()
    db.query(DocumentRecord).filter(DocumentRecord.project_id == project_id).delete()

    doc_rec = DocumentRecord(
        project_id=project_id,
        filename=f"Literature_Review_{project_id}.docx",
        file_type="docx",
        file_path=docx_path,
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
            project_id=project_id,
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

    proj = db.query(Project).filter(Project.id == project_id).first()
    proj.mode = "citation_auditor"
    proj.status = "audited"
    db.commit()

    return {
        "success": True,
        "message": "Literature review successfully transitioned to Citation Auditor.",
        "project_id": project_id,
        "issues_count": len(issues)
    }

# --- Export Center Endpoints ---
@app.get("/api/export/lit-review/{project_id}/docx")
def export_lit_review_docx(project_id: int, db: Session = Depends(get_db)):
    review = db.query(LiteratureReviewRecord).filter(LiteratureReviewRecord.project_id == project_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review_data = {
        "title": review.title,
        "domain": review.domain,
        "target_journal": review.target_journal,
        "citation_style": review.citation_style,
        "sections": json.loads(review.sections_json) if review.sections_json else [],
        "research_gaps": json.loads(review.gaps_json) if review.gaps_json else [],
        "references": json.loads(review.references_json) if review.references_json else [],
        "disclaimer": "Academic Integrity Note: This structured literature review must be critically reviewed and validated by the primary author prior to formal manuscript submission."
    }
    filename = f"Literature_Review_{project_id}.docx"
    output_path = os.path.join(EXPORT_DIR, filename)
    ExportService.generate_lit_review_docx(review_data, output_path)

    return FileResponse(
        output_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=filename
    )

@app.get("/api/export/audit-report/{project_id}/docx")
def export_audit_report_docx(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    issues = db.query(CitationIssueRecord).filter(CitationIssueRecord.project_id == project_id).all()
    issues_data = [
        {
            "category": i.category,
            "severity": i.severity,
            "cited_text": i.cited_text,
            "page": i.page,
            "paragraph": i.paragraph,
            "explanation": i.explanation,
            "suggested_correction": i.suggested_correction
        }
        for i in issues
    ]
    stats = {
        "total": len(issues),
        "errors": sum(1 for i in issues if i.severity == "error"),
        "warnings": sum(1 for i in issues if i.severity == "warning"),
        "status": project.status
    }
    filename = f"Audit_Report_Project_{project_id}.docx"
    output_path = os.path.join(EXPORT_DIR, filename)
    ExportService.generate_audit_report_docx(project.title, issues_data, stats, output_path)

    return FileResponse(
        output_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=filename
    )

@app.get("/api/export/sources/{project_id}/bibtex")
def export_sources_bibtex(project_id: int, db: Session = Depends(get_db)):
    sources = db.query(SavedSourceRecord).filter(SavedSourceRecord.project_id == project_id).all()
    sources_data = [
        {
            "title": s.title,
            "authors": s.authors,
            "year": s.year,
            "journal": s.journal,
            "doi": s.doi,
            "url": s.url
        }
        for s in sources
    ]
    bibtex_str = ExportService.generate_bibtex(sources_data)
    return PlainTextResponse(bibtex_str, media_type="text/plain", headers={"Content-Disposition": f"attachment; filename=sources_project_{project_id}.bib"})

# --- Saved Sources Endpoints ---
@app.get("/api/sources")
def get_all_saved_sources(db: Session = Depends(get_db)):
    sources = db.query(SavedSourceRecord).order_by(SavedSourceRecord.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "project_id": s.project_id,
            "title": s.title,
            "authors": s.authors,
            "year": s.year,
            "journal": s.journal,
            "doi": s.doi,
            "url": s.url,
            "citation_count": s.citation_count,
            "citation_source": s.citation_source,
            "abstract": s.abstract,
            "verification_status": s.verification_status,
            "relevance_score": s.relevance_score,
            "quartile": s.quartile,
            "created_at": s.created_at.isoformat()
        }
        for s in sources
    ]

@app.post("/api/sources")
def save_source(data: SaveSourceRequest, db: Session = Depends(get_db)):
    src = SavedSourceRecord(
        project_id=data.project_id,
        title=data.title,
        authors=data.authors,
        year=data.year,
        journal=data.journal,
        doi=data.doi,
        url=data.url,
        citation_count=data.citation_count,
        citation_source=data.citation_source,
        abstract=data.abstract,
        verification_status=data.verification_status,
        quartile=data.quartile
    )
    db.add(src)
    db.commit()
    db.refresh(src)
    return {"message": "Source saved successfully", "id": src.id}

@app.delete("/api/sources/{source_id}")
def delete_source(source_id: int, db: Session = Depends(get_db)):
    src = db.query(SavedSourceRecord).filter(SavedSourceRecord.id == source_id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(src)
    db.commit()
    return {"message": "Source deleted successfully"}
