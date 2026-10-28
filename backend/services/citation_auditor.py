import re
import difflib
from typing import List, Dict, Any, Optional

class CitationAuditor:
    UNSUPPORTED_CLAIM_PATTERNS = [
        r'\b(?:prior|previous|recent|earlier)\s+(?:studies|research|literature|investigations|authors)\s+(?:have\s+)?(?:shown|demonstrated|indicated|found|suggested|revealed)\b',
        r'\b(?:empirical|experimental|statistical)\s+(?:evidence|findings|data|results)\s+(?:indicate|demonstrate|show|reveal|suggest)\b',
        r'\b(?:it\s+has\s+been\s+widely\s+(?:documented|observed|reported|accepted))\b',
        r'\b(?:studies\s+(?:have\s+)?consistently\s+(?:proven|shown|highlighted))\b',
        r'\b(?:approximately|more\s+than|over)\s+\d+%\s+of\s+(?:users|patients|organizations|students|participants|systems)\b'
    ]

    @classmethod
    def audit_document(
        cls,
        in_text_citations: List[Dict[str, Any]],
        references: List[Dict[str, Any]],
        body_text: str,
        pages: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Executes deterministic citation matching, categorizing all issues into:
        - Category 1: In-text citation present, reference missing
        - Category 2: Reference present, in-text citation missing
        - Category 3: Incorrect or inconsistent citations
        - Optional: Unsupported claims without citation
        """
        issues = []
        matched_reference_indices = set()
        matched_citations = set()

        # Build lookup tables for references
        ref_by_num = {r["index"]: r for r in references if "index" in r}
        ref_by_surname = {}
        for r in references:
            surname = r.get("primary_surname", "").lower().strip()
            if surname:
                ref_by_surname.setdefault(surname, []).append(r)

        # -------------------------------------------------------------
        # STEP 1: CATEGORY 1 & CATEGORY 3 CHECK FOR IN-TEXT CITATIONS
        # -------------------------------------------------------------
        for cit in in_text_citations:
            cit_id = cit["id"]
            cit_type = cit.get("type")
            author = cit.get("author", "")
            year = cit.get("year", "")
            number = cit.get("number")
            raw_cit = cit.get("raw_citation", "")
            page = cit.get("page", 1)
            para = cit.get("paragraph", 1)

            # A. Numbered citations (IEEE / Vancouver)
            if cit_type == "numbered" and number is not None:
                if number in ref_by_num:
                    matched_reference_indices.add(number)
                    matched_citations.add(cit_id)
                else:
                    # Category 1: Numbered citation missing from reference list
                    issues.append({
                        "category": "category_1_missing_ref",
                        "severity": "error",
                        "status": "open",
                        "cited_text": f"[{number}]",
                        "author": None,
                        "year": None,
                        "page": page,
                        "paragraph": para,
                        "confidence": 0.98,
                        "explanation": f"Numbered citation [{number}] is cited in text on page {page}, but no reference entry numbered [{number}] exists in the bibliography.",
                        "suggested_correction": f"Add the corresponding bibliographic source for reference number [{number}].",
                        "verified_source": None
                    })
                continue

            # B. Author-Date citations (APA / Harvard / MLA)
            surname = cls._extract_clean_surname(author)
            clean_year = year.rstrip("abcdefgh") if year else ""

            # Check for et al. misuse (Category 3 check)
            if author and re.search(r'\bet\s+al\.?', author, re.IGNORECASE):
                # Count authors in citation string
                author_names = re.split(r'\s+(?:and|\&)\s+', re.sub(r'\bet\s+al\.?', '', author, flags=re.IGNORECASE).strip())
                if len(author_names) == 2:
                    issues.append({
                        "category": "category_3_inconsistent",
                        "severity": "warning",
                        "status": "open",
                        "cited_text": raw_cit,
                        "author": author,
                        "year": year,
                        "page": page,
                        "paragraph": para,
                        "confidence": 0.85,
                        "explanation": f"Inconsistent citation formatting: 'et al.' was used with two authors ('{author}'). Under APA 7th style, both author surnames must be written out without 'et al.'.",
                        "suggested_correction": f"Replace with '{author_names[0]} & {author_names[1]} ({year})'.",
                        "verified_source": None
                    })

            # Check matches in reference list
            exact_match = None
            candidate_matches = ref_by_surname.get(surname.lower(), [])

            for ref in candidate_matches:
                ref_year = (ref.get("year") or "").rstrip("abcdefgh")
                if clean_year and ref_year and clean_year == ref_year:
                    exact_match = ref
                    break

            if exact_match:
                matched_reference_indices.add(exact_match["index"])
                matched_citations.add(cit_id)
            else:
                # Let's inspect fuzzy match for Category 3 (typo in author name or year mismatch)
                fuzzy_found = False

                # 1. Year mismatch check: Same author, different year in reference list
                if candidate_matches:
                    first_cand = candidate_matches[0]
                    issues.append({
                        "category": "category_3_inconsistent",
                        "severity": "error",
                        "status": "open",
                        "cited_text": raw_cit,
                        "author": author,
                        "year": year,
                        "page": page,
                        "paragraph": para,
                        "confidence": 0.90,
                        "explanation": f"Publication year mismatch: In-text citation states {year}, but the reference list records publication year as {first_cand.get('year')} for author '{author}'.",
                        "suggested_correction": f"Verify whether the publication year should be {first_cand.get('year')} or if an additional publication exists.",
                        "verified_source": {
                            "title": first_cand.get("title"),
                            "year": first_cand.get("year"),
                            "doi": first_cand.get("doi")
                        }
                    })
                    fuzzy_found = True
                    matched_reference_indices.add(first_cand["index"])
                    matched_citations.add(cit_id)

                # 2. Author spelling mismatch check (difflib comparison)
                if not fuzzy_found and surname:
                    for ref in references:
                        ref_surname = ref.get("primary_surname", "")
                        ref_year = (ref.get("year") or "").rstrip("abcdefgh")
                        sim = difflib.SequenceMatcher(None, surname.lower(), ref_surname.lower()).ratio()
                        if sim >= 0.75 and ref_year == clean_year:
                            issues.append({
                                "category": "category_3_inconsistent",
                                "severity": "error",
                                "status": "open",
                                "cited_text": raw_cit,
                                "author": author,
                                "year": year,
                                "page": page,
                                "paragraph": para,
                                "confidence": 0.88,
                                "explanation": f"Author surname spelling mismatch: In-text citation has '{surname}' ({year}), but the bibliography lists '{ref_surname}' ({ref.get('year')}).",
                                "suggested_correction": f"Align the spelling to '{ref_surname}' ({year}) to match the bibliography entry.",
                                "verified_source": {
                                    "title": ref.get("title"),
                                    "year": ref.get("year"),
                                    "doi": ref.get("doi")
                                }
                            })
                            fuzzy_found = True
                            matched_reference_indices.add(ref["index"])
                            matched_citations.add(cit_id)
                            break

                # 3. If neither exact nor fuzzy match found -> CATEGORY 1: Missing Reference
                if not fuzzy_found:
                    issues.append({
                        "category": "category_1_missing_ref",
                        "severity": "error",
                        "status": "open",
                        "cited_text": raw_cit,
                        "author": author,
                        "year": year,
                        "page": page,
                        "paragraph": para,
                        "confidence": 0.95,
                        "explanation": f"In-text citation present, reference missing: '{raw_cit}' is cited on page {page}, paragraph {para}, but no corresponding entry exists in the reference list.",
                        "suggested_correction": f"Add the full bibliographic reference for {author} ({year}) to the references section.",
                        "verified_source": None
                    })

        # -------------------------------------------------------------
        # STEP 2: CATEGORY 2 - REFERENCE PRESENT, IN-TEXT CITATION MISSING
        # -------------------------------------------------------------
        for ref in references:
            ref_idx = ref.get("index")
            if ref_idx not in matched_reference_indices:
                author_display = ref.get("authors") or ref.get("primary_surname") or "Unknown Author"
                year_display = ref.get("year") or "n.d."
                issues.append({
                    "category": "category_2_missing_in_text",
                    "severity": "warning",
                    "status": "open",
                    "cited_text": ref.get("raw_text", "")[:150] + ("..." if len(ref.get("raw_text", "")) > 150 else ""),
                    "author": author_display,
                    "year": str(year_display),
                    "page": ref.get("page", 1),
                    "paragraph": ref_idx,
                    "confidence": 0.92,
                    "explanation": f"Reference present, in-text citation missing: The reference '{ref.get('title')}' by {author_display} ({year_display}) appears in the bibliography (entry #{ref_idx}), but was not found cited anywhere in the body text.",
                    "suggested_correction": "Either integrate a citation in the manuscript where relevant, or verify if the target journal permits supplemental background reading.",
                    "verified_source": {
                        "title": ref.get("title"),
                        "doi": ref.get("doi"),
                        "url": ref.get("url")
                    }
                })

        # -------------------------------------------------------------
        # STEP 3: CATEGORY 3 - REFERENCE METADATA CHECKS (Broken DOI, Duplicates)
        # -------------------------------------------------------------
        seen_dois = {}
        seen_titles = {}
        for ref in references:
            doi = ref.get("doi")
            title = (ref.get("title") or "").strip().lower()

            # A. Malformed DOI check
            if doi:
                if not re.match(r'^10\.\d{4,9}/[-._;()/:A-Za-z0-9]+$', doi):
                    issues.append({
                        "category": "category_3_inconsistent",
                        "severity": "error",
                        "status": "open",
                        "cited_text": f"doi: {doi}",
                        "author": ref.get("authors"),
                        "year": str(ref.get("year")),
                        "page": ref.get("page", 1),
                        "paragraph": ref.get("index", 1),
                        "confidence": 0.95,
                        "explanation": f"Broken or malformed DOI string '{doi}' detected in reference #{ref.get('index')}.",
                        "suggested_correction": "Verify the DOI format. Valid DOIs begin with '10.xxxx/' and conform to Crossref standards.",
                        "verified_source": None
                    })
                elif doi in seen_dois:
                    issues.append({
                        "category": "category_3_inconsistent",
                        "severity": "warning",
                        "status": "open",
                        "cited_text": ref.get("raw_text", "")[:120],
                        "author": ref.get("authors"),
                        "year": str(ref.get("year")),
                        "page": ref.get("page", 1),
                        "paragraph": ref.get("index", 1),
                        "confidence": 0.99,
                        "explanation": f"Duplicate reference detected: Reference #{ref.get('index')} shares identical DOI '{doi}' with reference #{seen_dois[doi]}.",
                        "suggested_correction": f"Consolidate duplicate references #{seen_dois[doi]} and #{ref.get('index')}.",
                        "verified_source": None
                    })
                else:
                    seen_dois[doi] = ref.get("index")

            # B. Duplicate title check
            if title and len(title) > 20:
                clean_title = re.sub(r'[^a-z0-9]', '', title)
                if clean_title in seen_titles:
                    prev_idx = seen_titles[clean_title]
                    if prev_idx != ref.get("index"):
                        issues.append({
                            "category": "category_3_inconsistent",
                            "severity": "warning",
                            "status": "open",
                            "cited_text": ref.get("title"),
                            "author": ref.get("authors"),
                            "year": str(ref.get("year")),
                            "page": ref.get("page", 1),
                            "paragraph": ref.get("index", 1),
                            "confidence": 0.92,
                            "explanation": f"Possible duplicate bibliographic entry: Reference #{ref.get('index')} has virtually identical title to reference #{prev_idx}.",
                            "suggested_correction": f"Check if reference #{prev_idx} and #{ref.get('index')} represent the same paper.",
                            "verified_source": None
                        })
                else:
                    seen_titles[clean_title] = ref.get("index")

        # -------------------------------------------------------------
        # STEP 4: UNSUPPORTED CLAIM DETECTION (Optional warnings)
        # -------------------------------------------------------------
        sentences = re.split(r'(?<=[.!?])\s+', body_text)
        claim_limit = 5  # limit to top 5 prominent claims to avoid alert fatigue
        found_claims = 0

        for s_idx, sentence in enumerate(sentences):
            sentence_clean = sentence.strip()
            if len(sentence_clean) < 40 or len(sentence_clean) > 300:
                continue

            # Check if sentence already has a citation
            has_citation = bool(re.search(r'\((?:19|20)\d{2}\)|\[\d+\]', sentence_clean))
            if has_citation:
                continue

            for pat in cls.UNSUPPORTED_CLAIM_PATTERNS:
                if re.search(pat, sentence_clean, re.IGNORECASE):
                    # Locate approximate page
                    page_num = 1
                    for p in pages:
                        if sentence_clean[:30] in p.get("text", ""):
                            page_num = p.get("page_number", 1)
                            break

                    issues.append({
                        "category": "unsupported_claim",
                        "severity": "info",
                        "status": "open",
                        "cited_text": sentence_clean,
                        "author": None,
                        "year": None,
                        "page": page_num,
                        "paragraph": s_idx + 1,
                        "confidence": 0.70,
                        "explanation": "Potential unsupported claim: This statement asserts empirical findings or previous research trends without an accompanying citation.",
                        "suggested_correction": "Add a supporting citation to ground this claim in peer-reviewed literature, or rephrase as author hypothesis/interpretation.",
                        "verified_source": None
                    })
                    found_claims += 1
                    break

            if found_claims >= claim_limit:
                break

        return issues

    @staticmethod
    def _extract_clean_surname(author_str: Optional[str]) -> str:
        if not author_str:
            return ""
        clean = re.sub(r'\bet\s+al\.?', '', author_str, flags=re.IGNORECASE).strip()
        clean = clean.split("&")[0].split("and")[0].strip()
        tokens = clean.split(",")
        if len(tokens) > 1:
            return tokens[0].strip()
        subtokens = clean.split()
        return subtokens[-1].strip() if subtokens else clean
