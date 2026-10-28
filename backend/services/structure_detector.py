import re
from typing import List, Dict, Any, Optional

CANONICAL_SECTIONS = [
    {"name": "Abstract", "patterns": [r"^\s*abstract\b", r"^\s*executive summary\b"]},
    {"name": "Introduction", "patterns": [r"^\s*(\d+(\.\d+)*\s+)?introduction\b", r"^\s*(\d+(\.\d+)*\s+)?background\b"]},
    {"name": "Literature Review", "patterns": [r"^\s*(\d+(\.\d+)*\s+)?literature review\b", r"^\s*(\d+(\.\d+)*\s+)?related work\b", r"^\s*(\d+(\.\d+)*\s+)?theoretical framework\b"]},
    {"name": "Methodology", "patterns": [r"^\s*(\d+(\.\d+)*\s+)?(research\s+)?methodology\b", r"^\s*(\d+(\.\d+)*\s+)?(research\s+)?methods\b", r"^\s*(\d+(\.\d+)*\s+)?materials and methods\b", r"^\s*(\d+(\.\d+)*\s+)?experimental design\b"]},
    {"name": "Results & Findings", "patterns": [r"^\s*(\d+(\.\d+)*\s+)?results\b", r"^\s*(\d+(\.\d+)*\s+)?findings\b", r"^\s*(\d+(\.\d+)*\s+)?data analysis\b"]},
    {"name": "Discussion", "patterns": [r"^\s*(\d+(\.\d+)*\s+)?discussion\b", r"^\s*(\d+(\.\d+)*\s+)?implications\b"]},
    {"name": "Limitations & Future Research", "patterns": [r"^\s*(\d+(\.\d+)*\s+)?limitations\b", r"^\s*(\d+(\.\d+)*\s+)?future (research|work|directions)\b"]},
    {"name": "Conclusion", "patterns": [r"^\s*(\d+(\.\d+)*\s+)?conclusion(s)?\b", r"^\s*(\d+(\.\d+)*\s+)?concluding remarks\b"]},
    {"name": "Acknowledgements", "patterns": [r"^\s*acknowledg(e)?ments?\b", r"^\s*funding\b"]},
    {"name": "References", "patterns": [r"^\s*(\d+(\.\d+)*\s+)?references\b", r"^\s*(\d+(\.\d+)*\s+)?bibliography\b", r"^\s*(\d+(\.\d+)*\s+)?works cited\b"]},
    {"name": "Appendices", "patterns": [r"^\s*appendi(x|ces)\b", r"^\s*supplementary material\b"]}
]

class StructureDetector:
    @staticmethod
    def detect_sections(pages: List[Dict[str, Any]], full_text: str) -> List[Dict[str, Any]]:
        """
        Detects academic sections, assigns page numbers and paragraph markers,
        and constructs a numbered Table of Contents.
        """
        detected_sections = []
        found_types = set()

        # Iterate through pages and blocks
        for page in pages:
            page_num = page.get("page_number", 1)
            blocks = page.get("blocks", [])

            for block_idx, block in enumerate(blocks):
                lines = block.get("lines", [block.get("text", "")])
                first_line = lines[0].strip() if lines else ""

                # Test line against canonical sections
                for sec_def in CANONICAL_SECTIONS:
                    sec_name = sec_def["name"]
                    # If already found section earlier, don't duplicate unless it's a sub-element
                    if sec_name in found_types:
                        continue

                    for pat in sec_def["patterns"]:
                        if re.search(pat, first_line, re.IGNORECASE) and len(first_line) < 80:
                            found_types.add(sec_name)
                            detected_sections.append({
                                "name": sec_name,
                                "raw_heading": first_line,
                                "page": page_num,
                                "block_index": block_idx,
                                "bbox": block.get("bbox", [50, 50, 500, 100])
                            })
                            break
                    if sec_name in found_types:
                        break

        # Fallback heuristic if no sections found or few sections found: search text lines
        if len(detected_sections) < 2:
            lines = full_text.split("\n")
            line_offset = 0
            for idx, line in enumerate(lines[:300]):
                cleaned = line.strip()
                for sec_def in CANONICAL_SECTIONS:
                    sec_name = sec_def["name"]
                    if sec_name in found_types:
                        continue
                    for pat in sec_def["patterns"]:
                        if re.search(pat, cleaned, re.IGNORECASE) and len(cleaned) < 60:
                            found_types.add(sec_name)
                            # approximate page from line index
                            approx_page = max(1, (idx // 40) + 1)
                            detected_sections.append({
                                "name": sec_name,
                                "raw_heading": cleaned,
                                "page": min(approx_page, len(pages)),
                                "block_index": 0,
                                "bbox": [50, 100, 500, 140]
                            })
                            break

        # Sort by page order
        detected_sections.sort(key=lambda s: s["page"])

        # Construct structured Table of Contents with formatted numbering e.g. "01. Abstract"
        toc = []
        for idx, sec in enumerate(detected_sections, start=1):
            toc.append({
                "number": f"{idx:02d}",
                "name": sec["name"],
                "heading": sec["raw_heading"],
                "page": sec["page"],
                "bbox": sec.get("bbox")
            })

        return toc

    @staticmethod
    def extract_reference_section_text(pages: List[Dict[str, Any]], full_text: str) -> Dict[str, Any]:
        """
        Locates the exact start of the References / Bibliography section and returns:
        - reference text
        - start page
        - body text (everything before references)
        """
        ref_patterns = [
            r"\n\s*(?:[0-9IVX]+\.?\s+)?references\s*\n",
            r"\n\s*(?:[0-9IVX]+\.?\s+)?bibliography\s*\n",
            r"\n\s*(?:[0-9IVX]+\.?\s+)?works cited\s*\n"
        ]

        match_start = -1
        for pat in ref_patterns:
            matches = list(re.finditer(pat, full_text, re.IGNORECASE))
            if matches:
                # Usually references are near the end of the paper
                # Pick the last match that is in the last 40% of the document if possible
                chosen = matches[-1]
                match_start = chosen.end()
                break

        if match_start != -1:
            body_text = full_text[:match_start]
            ref_text = full_text[match_start:]
        else:
            # Fallback if no explicit heading found: check last 20% of text
            split_point = int(len(full_text) * 0.8)
            body_text = full_text[:split_point]
            ref_text = full_text[split_point:]

        return {
            "body_text": body_text,
            "reference_text": ref_text,
            "has_explicit_ref_section": match_start != -1
        }
