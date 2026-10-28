import re
from typing import List, Dict, Any, Optional, Tuple

class CitationExtractor:
    # Match parenthetical citations e.g. (Smith, 2020), (Smith & Jones, 2021), (Smith et al., 2019; Doe, 2022)
    # Includes multiple works e.g. (Smith, 2020a, 2020b)
    PARENTHETICAL_REGEX = re.compile(
        r'\((?P<content>[A-Z][A-Za-z\s\-\.\'\&]+(?:et\s+al\.?)?,?\s*(?:19|20)\d{2}[a-z]?'
        r'(?:;\s*[A-Z][A-Za-z\s\-\.\'\&]+(?:et\s+al\.?)?,?\s*(?:19|20)\d{2}[a-z]?)*'
        r'(?:,\s*pp?\.?\s*\d+(?:-\d+)?)?)\)'
    )

    # Narrative citations e.g. Smith (2020), Smith et al. (2021), Smith and Jones (2019)
    NARRATIVE_REGEX = re.compile(
        r'(?P<author>[A-Z][a-zA-Z\-\']+(?:\s+(?:and|\&)\s+[A-Z][a-zA-Z\-\']+)?(?:\s+et\s+al\.?)?)\s*\((?P<year>(?:19|20)\d{2}[a-z]?)(?:,\s*pp?\.?\s*\d+(?:-\d+)?)?\)'
    )

    # Numbered citations e.g. [1], [1, 2], [1-4], [1, 3, 5]
    NUMBERED_BRACKET_REGEX = re.compile(r'\[(?P<nums>\d+(?:\s*[,-]\s*\d+)*)\]')

    # Common DOI extraction regex
    DOI_REGEX = re.compile(r'(?:https?://(?:dx\.)?doi\.org/|doi:\s*|DOI:\s*)?(10\.\d{4,9}/[-._;()/:A-Za-z0-9]+)')

    @classmethod
    def extract_in_text_citations(cls, body_text: str, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Extracts in-text citations from the body text and maps them to their page numbers.
        """
        extracted = []
        seen_keys = set()

        # 1. Parenthetical Author-Date citations
        for match in cls.PARENTHETICAL_REGEX.finditer(body_text):
            raw_group = match.group(0)
            content = match.group("content")
            start_pos = match.start()

            # Split compound citations inside semicolon e.g. (Smith, 2020; Johnson et al., 2021)
            sub_citations = content.split(";")
            for sub in sub_citations:
                sub = sub.strip()
                # Clean off trailing page numbers e.g. "Smith, 2020, p. 15"
                sub_clean = re.sub(r',?\s*pp?\.?\s*\d+(?:-\d+)?', '', sub)

                # Extract author & year
                year_match = re.search(r'\b((?:19|20)\d{2}[a-z]?)\b', sub_clean)
                if not year_match:
                    continue
                year = year_match.group(1)
                author_part = sub_clean[:year_match.start()].strip().rstrip(",")

                if not author_part or len(author_part) < 2:
                    continue

                # Filter false positives: ignore "e.g.", "i.e.", "see", "Table 1", "Figure 2"
                if re.match(r'^(table|fig|figure|equation|eq|see|e\.g\.|i\.e\.|page|p\.)\b', author_part, re.IGNORECASE):
                    continue

                page_num, para_num = cls._locate_in_pages(raw_group, pages, start_pos)
                cit_id = f"cit_{author_part.lower()}_{year}_{page_num}_{match.start()}"

                if cit_id not in seen_keys:
                    seen_keys.add(cit_id)
                    extracted.append({
                        "id": cit_id,
                        "raw_citation": raw_group,
                        "specific_citation": sub,
                        "type": "parenthetical",
                        "author": author_part,
                        "year": year,
                        "page": page_num,
                        "paragraph": para_num,
                        "start_offset": start_pos,
                        "style": "Author-Date"
                    })

        # 2. Narrative Author-Date citations
        for match in cls.NARRATIVE_REGEX.finditer(body_text):
            raw_citation = match.group(0)
            author = match.group("author").strip()
            year = match.group("year").strip()
            start_pos = match.start()

            # Filter non-citations (e.g. "Chapter (2020)")
            if re.match(r'^(table|figure|section|equation|eq|part|chapter|volume)\b', author, re.IGNORECASE):
                continue

            page_num, para_num = cls._locate_in_pages(raw_citation, pages, start_pos)
            cit_id = f"cit_{author.lower()}_{year}_{page_num}_{start_pos}"

            if cit_id not in seen_keys:
                seen_keys.add(cit_id)
                extracted.append({
                    "id": cit_id,
                    "raw_citation": raw_citation,
                    "specific_citation": raw_citation,
                    "type": "narrative",
                    "author": author,
                    "year": year,
                    "page": page_num,
                    "paragraph": para_num,
                    "start_offset": start_pos,
                    "style": "Author-Date"
                })

        # 3. Numbered citations [1], [2], [1-3]
        for match in cls.NUMBERED_BRACKET_REGEX.finditer(body_text):
            raw_bracket = match.group(0)
            nums_str = match.group("nums")
            start_pos = match.start()

            # Expand numbers e.g. "1-3" -> 1, 2, 3 or "1, 4" -> 1, 4
            expanded_nums = cls._expand_number_range(nums_str)
            page_num, para_num = cls._locate_in_pages(raw_bracket, pages, start_pos)

            for num in expanded_nums:
                cit_id = f"cit_num_{num}_{page_num}_{start_pos}"
                if cit_id not in seen_keys:
                    seen_keys.add(cit_id)
                    extracted.append({
                        "id": cit_id,
                        "raw_citation": raw_bracket,
                        "specific_citation": f"[{num}]",
                        "type": "numbered",
                        "number": num,
                        "author": None,
                        "year": None,
                        "page": page_num,
                        "paragraph": para_num,
                        "start_offset": start_pos,
                        "style": "Numbered"
                    })

        return extracted

    @classmethod
    def extract_references_list(cls, reference_text: str, start_page: int = 1) -> List[Dict[str, Any]]:
        """
        Parses individual reference entries from the References section.
        """
        entries = []
        lines = [l.strip() for l in reference_text.split("\n") if l.strip()]

        raw_entries = []
        current_entry = []

        # Heuristic to separate entries:
        # A new entry starts if:
        # 1. Starts with bracketed number: "[1]"
        # 2. Starts with standard number: "1."
        # 3. Starts with author surname + comma: "Smith, J. D." or "Miller, A. (2021)"
        for line in lines:
            is_new_entry = False

            if re.match(r'^\[\d+\]', line) or re.match(r'^\d+\.\s+', line):
                is_new_entry = True
            elif current_entry and re.match(r'^[A-Z][a-zA-Z\-\'\s]+,\s*[A-Z]\.', line):
                is_new_entry = True
            elif current_entry and re.match(r'^[A-Z][a-zA-Z\-\']+\s+\((?:19|20)\d{2}[a-z]?\)', line):
                is_new_entry = True

            if is_new_entry and current_entry:
                raw_entries.append(" ".join(current_entry))
                current_entry = [line]
            else:
                current_entry.append(line)

        if current_entry:
            raw_entries.append(" ".join(current_entry))

        # Now parse each raw reference entry
        for idx, text in enumerate(raw_entries, start=1):
            parsed = cls._parse_single_reference(text, idx, start_page)
            entries.append(parsed)

        return entries

    @classmethod
    def _parse_single_reference(cls, text: str, index: int, base_page: int) -> Dict[str, Any]:
        """
        Extracts author, year, title, journal, DOI from a single reference string.
        """
        # 1. Number prefix if any
        num_match = re.match(r'^\[?(\d+)\]?\.?\s*', text)
        ref_number = int(num_match.group(1)) if num_match else index

        cleaned_text = re.sub(r'^\[?\d+\]?\.?\s*', '', text)

        # 2. Year extraction
        year_match = re.search(r'\b((?:19|20)\d{2}[a-z]?)\b', cleaned_text)
        year = year_match.group(1) if year_match else None

        # 3. DOI extraction
        doi_match = cls.DOI_REGEX.search(cleaned_text)
        doi = doi_match.group(1) if doi_match else None
        # Clean trailing dot or comma from DOI
        if doi:
            doi = doi.rstrip(".,;")

        # 4. Authors extraction (heuristics for APA/Harvard/IEEE)
        authors = ""
        title = ""
        journal = ""

        if year_match:
            authors_part = cleaned_text[:year_match.start()].strip().rstrip("(. ")
            authors = authors_part
            remainder = cleaned_text[year_match.end():].strip().lstrip(")., ")

            # Split title and journal: usually title is ended with a period
            parts = remainder.split(". ")
            if len(parts) >= 1:
                title = parts[0].strip()
            if len(parts) >= 2:
                journal = parts[1].strip()
        else:
            # Fallback title & authors
            parts = cleaned_text.split(". ")
            authors = parts[0].strip() if len(parts) > 0 else ""
            title = parts[1].strip() if len(parts) > 1 else cleaned_text

        # Extract primary surname for citation matching
        primary_surname = cls._extract_primary_surname(authors)

        return {
            "index": ref_number,
            "raw_text": text,
            "authors": authors,
            "primary_surname": primary_surname,
            "year": year,
            "title": title or text[:120],
            "journal": journal,
            "doi": doi,
            "url": f"https://doi.org/{doi}" if doi else None,
            "page": base_page
        }

    @staticmethod
    def _extract_primary_surname(authors_str: str) -> str:
        """
        Pulls out the leading author's surname. e.g. 'Smith, J. A., & Doe, B.' -> 'Smith'
        or 'John Smith, Alan Turing' -> 'Smith'
        """
        if not authors_str:
            return ""
        # Remove 'et al'
        clean = re.sub(r'\bet\s+al\.?', '', authors_str, flags=re.IGNORECASE).strip()
        first_author = clean.split(",")[0].strip()
        # If format is "First Last", take last token
        tokens = first_author.split()
        if tokens:
            return tokens[0].strip() if "," in clean else tokens[-1].strip()
        return first_author

    @staticmethod
    def _expand_number_range(nums_str: str) -> List[int]:
        result = []
        parts = nums_str.split(",")
        for part in parts:
            part = part.strip()
            if "-" in part:
                sub_parts = part.split("-")
                if len(sub_parts) == 2 and sub_parts[0].strip().isdigit() and sub_parts[1].strip().isdigit():
                    s, e = int(sub_parts[0].strip()), int(sub_parts[1].strip())
                    result.extend(range(s, min(e + 1, s + 50)))
            elif part.isdigit():
                result.append(int(part))
        return result

    @staticmethod
    def _locate_in_pages(citation_text: str, pages: List[Dict[str, Any]], start_offset: int) -> Tuple[int, int]:
        """
        Finds the exact page number and estimated paragraph index for a given citation span.
        """
        for page in pages:
            if citation_text in page.get("text", ""):
                # Approximate paragraph by blocks or line breaks
                text_before = page["text"].split(citation_text)[0]
                para_num = text_before.count("\n\n") + 1
                return page.get("page_number", 1), para_num

        # Fallback to page 1
        return 1, 1
