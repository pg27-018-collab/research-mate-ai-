import pytest
from services.citation_extractor import CitationExtractor
from services.citation_auditor import CitationAuditor
from services.structure_detector import StructureDetector

SAMPLE_MANUSCRIPT = """
Abstract
Academic referencing integrity is foundational to empirical research. This study evaluates automated auditing tools.

Introduction
In recent years, artificial intelligence has reshaped scholarly discovery (Vaswani et al., 2021).
However, citation errors continue to proliferate across disciplines (Sharma, 2022).
Furthermore, Smyth et al. (2021) explored the role of transformer models in bibliometrics.
Earlier empirical studies have demonstrated that over 40% of published manuscripts contain referencing defects.
Finally, numbered citation schemes have also gained prominence [1].

Methodology
We evaluated 500 peer-reviewed articles using our multi-stage extraction pipeline.

Results & Discussion
The experimental findings indicate marked improvements in parsing fidelity.

Conclusion
Automated verification provides indispensable assistance to academic authors.

References
[1] Vaswani, A., & Shazeer, N. (2021). Attention mechanisms in deep networks. Journal of Machine Learning.
[2] Smith, J. (2021). Natural language architectures in bibliometrics. Artificial Intelligence Review. doi: 10.1007/s10462-021-09999-x
[3] Uncited, R. (2023). Neglected scholarly work in contemporary science. Journal of Informetrics.
[4] Broken, D. (2022). Malformed identifiers in digital libraries. Library Trends. doi: invalid-doi-format-123
"""

def test_citation_extraction_and_audit():
    pages = [{"page_number": 1, "text": SAMPLE_MANUSCRIPT, "blocks": []}]
    
    # 1. Structure Detection
    toc = StructureDetector.detect_sections(pages, SAMPLE_MANUSCRIPT)
    assert any(sec["name"] == "Introduction" for sec in toc)
    assert any(sec["name"] == "References" for sec in toc)

    # 2. Extract sections
    split = StructureDetector.extract_reference_section_text(pages, SAMPLE_MANUSCRIPT)
    body_text = split["body_text"]
    ref_text = split["reference_text"]

    # 3. Extract Citations & References
    citations = CitationExtractor.extract_in_text_citations(body_text, pages)
    references = CitationExtractor.extract_references_list(ref_text, start_page=1)

    assert len(citations) >= 3
    assert len(references) >= 3

    # 4. Audit Document
    issues = CitationAuditor.audit_document(citations, references, body_text, pages)
    assert len(issues) > 0

    categories = [i["category"] for i in issues]
    
    # Verify Category 1 is detected: (Sharma, 2022) is cited in text but missing in references
    assert "category_1_missing_ref" in categories
    sharma_issue = next(i for i in issues if i["category"] == "category_1_missing_ref")
    assert "Sharma" in sharma_issue["cited_text"] or "Sharma" in (sharma_issue.get("author") or "")

    # Verify Category 2 is detected: Uncited, R. (2023) is in references but not cited
    assert "category_2_missing_in_text" in categories

    # Verify Category 3 is detected: Smyth vs Smith spelling typo or broken DOI
    assert "category_3_inconsistent" in categories

    # Verify Unsupported Claim detection
    assert "unsupported_claim" in categories
