import datetime
import json
from typing import Optional, List, Any
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./researchmate.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    mode = Column(String(50), default="citation_auditor")  # 'citation_auditor' or 'literature_review'
    status = Column(String(50), default="active")  # 'draft', 'analyzing', 'completed', 'active'
    target_journal = Column(String(255), nullable=True)
    citation_style = Column(String(50), default="APA 7th")
    meta_info = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    documents = relationship("DocumentRecord", back_populates="project", cascade="all, delete-orphan")
    issues = relationship("CitationIssueRecord", back_populates="project", cascade="all, delete-orphan")
    saved_sources = relationship("SavedSourceRecord", back_populates="project", cascade="all, delete-orphan")
    reviews = relationship("LiteratureReviewRecord", back_populates="project", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLogRecord", back_populates="project", cascade="all, delete-orphan")

class DocumentRecord(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)  # 'pdf' or 'docx'
    file_path = Column(String(1000), nullable=False)
    page_count = Column(Integer, default=1)
    word_count = Column(Integer, default=0)
    structure_json = Column(Text, nullable=True)  # JSON sections with pages/offsets
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="documents")
    issues = relationship("CitationIssueRecord", back_populates="document")

class CitationIssueRecord(Base):
    __tablename__ = "citation_issues"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    category = Column(String(100), nullable=False)  # 'category_1_missing_ref', 'category_2_missing_in_text', 'category_3_inconsistent', 'unsupported_claim'
    severity = Column(String(20), default="warning")  # 'error', 'warning', 'info'
    status = Column(String(20), default="open")  # 'open', 'reviewing', 'resolved', 'dismissed'
    cited_text = Column(Text, nullable=False)
    author = Column(String(255), nullable=True)
    year = Column(String(50), nullable=True)
    page = Column(Integer, default=1)
    paragraph = Column(Integer, default=1)
    confidence = Column(Float, default=1.0)
    explanation = Column(Text, nullable=False)
    suggested_correction = Column(Text, nullable=True)
    verified_source = Column(Text, nullable=True)  # JSON
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="issues")
    document = relationship("DocumentRecord", back_populates="issues")

class SavedSourceRecord(Base):
    __tablename__ = "saved_sources"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    title = Column(String(1000), nullable=False)
    authors = Column(Text, nullable=True)  # Comma separated or JSON
    year = Column(Integer, nullable=True)
    journal = Column(String(500), nullable=True)
    doi = Column(String(255), nullable=True)
    url = Column(String(1000), nullable=True)
    citation_count = Column(Integer, default=0)
    citation_source = Column(String(100), default="OpenAlex")
    abstract = Column(Text, nullable=True)
    verification_status = Column(String(100), default="verified")  # 'verified', 'crossref_verified', 'unverified'
    relevance_score = Column(Float, default=0.0)
    quartile = Column(String(20), nullable=True)  # 'Q1', 'Q2', etc.
    is_saved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="saved_sources")

class LiteratureReviewRecord(Base):
    __tablename__ = "literature_reviews"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(1000), nullable=False)
    domain = Column(String(255), nullable=True)
    target_journal = Column(String(255), nullable=True)
    citation_style = Column(String(50), default="APA 7th")
    sections_json = Column(Text, nullable=False)  # list of {title, content, sources_cited}
    gaps_json = Column(Text, nullable=True)      # list of {gap_title, description, supporting_studies}
    references_json = Column(Text, nullable=True)  # list of formatted reference strings
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="reviews")

class AuditLogRecord(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    action_type = Column(String(100), nullable=False)  # 'issue_resolved', 'citation_edited', 'reference_added'
    description = Column(Text, nullable=False)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="audit_logs")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
