export interface ServerProject {
  id: number;
  title: string;
  mode: string;
  status: string;
  target_journal?: string;
  citation_style: string;
  created_at: string;
  has_document: boolean;
  doc_filename?: string;
  total_issues: number;
  open_issues: number;
  has_review: boolean;
  document?: any;
  issues?: any[];
  review?: any;
  saved_sources?: any[];
}

// In-memory store for serverless execution, seeded with benchmark data
export const serverProjects: ServerProject[] = [
  {
    id: 1,
    title: "Automated Verification of Scholarly Citations and Reference Integrity",
    mode: "citation_auditor",
    status: "audited",
    target_journal: "Journal of Informetrics",
    citation_style: "APA 7th",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    has_document: true,
    doc_filename: "sample_academic_paper.pdf",
    total_issues: 6,
    open_issues: 6,
    has_review: false,
    document: {
      id: 1,
      filename: "sample_academic_paper.pdf",
      file_type: "pdf",
      page_count: 2,
      word_count: 420,
      structure: [
        { number: "01", name: "Abstract", heading: "Abstract", page: 1 },
        { number: "02", name: "Introduction", heading: "1. Introduction", page: 1 },
        { number: "03", name: "Literature Review", heading: "2. Literature Review", page: 1 },
        { number: "04", name: "Methodology", heading: "3. Research Methodology", page: 2 },
        { number: "05", name: "Results & Findings", heading: "4. Results & Discussion", page: 2 },
        { number: "06", name: "Conclusion", heading: "5. Conclusion", page: 2 },
        { number: "07", name: "References", heading: "References", page: 2 }
      ],
      full_text: `Title: Automated Verification of Scholarly Citations and Reference Integrity in Academic Publishing

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
[6] Broken, D. (2022). Malformed identifiers in open access repositories. Library Trends. doi: malformed-doi-xyz`
    },
    issues: [
      {
        id: 101,
        category: "category_1_missing_ref",
        severity: "error",
        status: "open",
        cited_text: "(Sharma, 2022)",
        author: "Sharma",
        year: "2022",
        page: 1,
        paragraph: 2,
        confidence: 0.95,
        explanation: "In-text citation present, reference missing: '(Sharma, 2022)' is cited on page 1, paragraph 2, but no corresponding entry exists in the reference list.",
        suggested_correction: "Add the full bibliographic reference for Sharma (2022) to the references section.",
        created_at: new Date().toISOString()
      },
      {
        id: 102,
        category: "category_2_missing_in_text",
        severity: "warning",
        status: "open",
        cited_text: "Uncited, R. (2023). Neglected scholarly work in contemporary bibliometric indexes...",
        author: "Uncited, R.",
        year: "2023",
        page: 2,
        paragraph: 5,
        confidence: 0.92,
        explanation: "Reference present, in-text citation missing: The reference appears in the bibliography (entry #5), but was not found cited anywhere in the body text.",
        suggested_correction: "Integrate a citation in the manuscript where relevant, or verify if the target journal permits supplemental reading.",
        created_at: new Date().toISOString()
      },
      {
        id: 103,
        category: "category_3_inconsistent",
        severity: "error",
        status: "open",
        cited_text: "Smyth et al. (2021)",
        author: "Smyth",
        year: "2021",
        page: 1,
        paragraph: 3,
        confidence: 0.88,
        explanation: "Author surname spelling mismatch: In-text citation has 'Smyth' (2021), but bibliography lists 'Smith, J.' (2021).",
        suggested_correction: "Align the spelling to 'Smith et al. (2021)' to match the bibliography entry.",
        created_at: new Date().toISOString()
      },
      {
        id: 104,
        category: "category_3_inconsistent",
        severity: "error",
        status: "open",
        cited_text: "Martinez (2020)",
        author: "Martinez",
        year: "2020",
        page: 1,
        paragraph: 4,
        confidence: 0.90,
        explanation: "Publication year mismatch: In-text citation states 2020, but the reference list records publication year as 2022.",
        suggested_correction: "Change citation to Martinez (2022) or verify if an earlier 2020 paper exists.",
        created_at: new Date().toISOString()
      },
      {
        id: 105,
        category: "category_3_inconsistent",
        severity: "error",
        status: "open",
        cited_text: "doi: malformed-doi-xyz",
        author: "Broken, D.",
        year: "2022",
        page: 2,
        paragraph: 6,
        confidence: 0.98,
        explanation: "Broken or malformed DOI string detected in reference #6. Valid DOIs begin with '10.xxxx/'.",
        suggested_correction: "Verify the correct DOI identifier on Crossref.",
        created_at: new Date().toISOString()
      },
      {
        id: 106,
        category: "unsupported_claim",
        severity: "info",
        status: "open",
        cited_text: "Prior empirical studies have demonstrated that over 40% of published manuscripts contain referencing defects.",
        author: null,
        year: null,
        page: 1,
        paragraph: 3,
        confidence: 0.70,
        explanation: "Potential unsupported claim: This statement asserts empirical findings without an accompanying citation.",
        suggested_correction: "Add a supporting citation to ground this claim in peer-reviewed literature.",
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 2,
    title: "Empirical Evaluation of Automated Citation Auditing and Scholarly Verification",
    mode: "literature_review",
    status: "completed",
    target_journal: "Journal of Informetrics",
    citation_style: "APA 7th",
    created_at: new Date(Date.now() - 43200000).toISOString(),
    has_document: false,
    total_issues: 0,
    open_issues: 0,
    has_review: true,
    review: {
      id: 2,
      title: "Empirical Evaluation of Automated Citation Auditing and Scholarly Verification",
      domain: "Computer Science & Informetrics",
      target_journal: "Journal of Informetrics",
      citation_style: "APA 7th",
      word_count: 640,
      created_at: new Date().toISOString(),
      disclaimer: "Academic Integrity Note: This structured literature review synthesizes verified publications and must be critically reviewed and validated by the primary author prior to formal manuscript submission.",
      sections: [
        {
          section_number: 1,
          title: "Theoretical Foundations of Automated Reference Extraction and Bibliometric Graph Topology",
          content: "The theoretical framing of automated citation auditing traces back to foundational scientometric and information retrieval paradigms. Early algorithmic parsers conceptualized bibliographic entries as isolated string sequences processed via regular expressions. In a seminal contribution, Martinez (2022) established that citation graph distortion propagates exponentially when latent reference defects remain uncorrected at the publisher level. Their empirical findings across 12,000 papers in Journal of Informetrics proved that manual editorial proofreading misses over 38% of author-year and broken DOI discrepancies. Integrating deterministic heuristics with modern contextual embeddings resolves non-linear boundary constraints, substantially elevating representation fidelity.",
          sources_cited: ["Citation Inconsistencies and Referencing Accuracy in Contemporary Academic Publishing", "Natural Language Architectures in Bibliometrics"]
        },
        {
          section_number: 2,
          title: "Comparative Empirical Performance: Automated Neural Engines vs Manual Human Auditing",
          content: "Recent peer-reviewed literature published between 2021 and 2025 provides robust quantitative comparisons addressing our core research objective: How do automated verification engines compare against manual bibliometric auditing in terms of precision, recall, and false positive rates? As demonstrated by Brown & Taylor (2023) in Quantitative Science Studies, automated rule-based engines achieve high precision (0.94) on standard single-author entries but suffer severe recall degradation (0.68) when encountering complex consortium abbreviations and transliterated non-Latin surnames. Conversely, manual proofreading maintains stable recall but introduces an unacceptable false positive rate (14.2%) due to fatigue and formatting ambiguities. Hybrid verification architectures combine the rapid deterministic matching of Crossref/OpenAlex registries with neural disambiguation, achieving a macro-F1 of 0.91.",
          sources_cited: ["Collaborative Multi-Author Citation Patterns in Computational Sciences", "Systematic Evaluation of Open Scholarly Metadata"]
        },
        {
          section_number: 3,
          title: "Error Boundary Divergence: Hallucinated DOIs, Consortium Misattribution, and PDF Layout Noise",
          content: "A critical review of contemporary bibliometric methodologies reveals pronounced performance divergence when evaluating raw camera-ready PDF manuscripts versus pre-parsed XML corpuses. While text extractors report near-perfect accuracy under synthetic conditions, multi-column layouts, footnote citations, and mathematical symbol collisions cause severe boundary clipping. Furthermore, generative AI tools frequently introduce hallucinated digital object identifiers that mimic legitimate Crossref schemas. Reconciling these multi-registry discrepancies and establishing reproducible benchmarking protocols remains the primary prerequisite for editorial adoption in high-impact venues such as Journal of Informetrics.",
          sources_cited: ["Neglected Scholarly Work in Contemporary Bibliometric Indexes", "Malformed Identifiers in Open Access Repositories"]
        }
      ],
      research_gaps: [
        {
          gap_title: "Absence of Standardized Multi-Corpus Benchmarks for Citation Defect Detection",
          description: "Current literature evaluates citation auditing tools on closed publisher datasets or isolated synthetic samples rather than open, reproducible multi-publisher corpuses.",
          supporting_evidence: "Identified as a critical bottleneck in Martinez (2022) and Brown & Taylor (2023)."
        },
        {
          gap_title: "Lack of Stress-Testing Under Real-World PDF Layout Noise and OCR Inaccuracies",
          description: "Existing verification models assume clean text input, failing to quantify error propagation from multi-column PDF layouts, floating figures, and varied publisher styles.",
          supporting_evidence: "Highlighted by Visser et al. (2021) in Quantitative Science Studies."
        },
        {
          gap_title: "Vulnerability to LLM-Generated Hallucinated DOIs in Modern Submissions",
          description: "Traditional bibliometric audit pipelines lack real-time Crossref/OpenAlex cryptographic and landing-page validation to flag synthetically fabricated citations.",
          supporting_evidence: "Unresolved challenge in post-2023 scientific publishing workflows."
        }
      ],
      references: [
        "Brown, K., & Taylor, S. (2023). Collaborative multi-author citation patterns in computational sciences. Quantitative Science Studies, 4(1), 112–134. https://doi.org/10.1162/qss_a_00112",
        "Gao, Y., Xiong, Y., Gao, X., Jia, K., & Pan, J. (2024). A Survey on Retrieval-Augmented Generation for Large Language Models. IEEE Transactions on Knowledge and Data Engineering, 36(5), 2104–2122. https://doi.org/10.1109/TKDE.2024.3364789",
        "Martinez, R. (2022). Longitudinal analysis of citation inaccuracies in scholarly publishing. Journal of Informetrics, 16(2), 101284. https://doi.org/10.1016/j.joi.2022.101284",
        "Smith, J. (2021). Natural language architectures in bibliometrics: A systematic review. Artificial Intelligence Review, 54(3), 1989–2018. https://doi.org/10.1007/s10462-021-09999-x",
        "Vaswani, A., & Shazeer, N. (2021). Attention mechanisms in deep neural networks. Advances in Neural Information Processing Systems, 30, 5998–6008. https://doi.org/10.5555/3295222.3295349",
        "Visser, M., van Eck, N. J., & Waltman, L. (2021). Systematic Evaluation of Open Scholarly Metadata: Crossref, OpenAlex, and Scopus Comparison. Quantitative Science Studies, 2(1), 27–40. https://doi.org/10.1162/qss_a_00112"
      ]
    }
  }
];

export const serverSavedSources: any[] = [
  {
    id: 1,
    title: "Longitudinal analysis of citation inaccuracies in scholarly publishing",
    authors: "Martinez, R., & Henderson, C.",
    year: 2022,
    journal: "Journal of Informetrics",
    doi: "10.1016/j.joi.2022.101284",
    url: "https://doi.org/10.1016/j.joi.2022.101284",
    citation_count: 142,
    citation_source: "OpenAlex Verified",
    abstract: "In this longitudinal empirical study across 12,000 papers, we quantify the prevalence of missing references, uncited entries, and author name mismatches, showing that over 38% of published articles contain latent referencing discrepancies.",
    verification_status: "verified",
    relevance_score: 0.98,
    quartile: "Q1"
  },
  {
    id: 2,
    title: "Collaborative multi-author citation patterns in computational sciences",
    authors: "Brown, K., & Taylor, S.",
    year: 2023,
    journal: "Quantitative Science Studies",
    doi: "10.1162/qss_a_00112",
    url: "https://doi.org/10.1162/qss_a_00112",
    citation_count: 88,
    citation_source: "OpenAlex Verified",
    abstract: "Examines consortium referencing ambiguities and evaluates automated parser degradation when handling complex 'et al.' constructs and institutional affiliations.",
    verification_status: "verified",
    relevance_score: 0.94,
    quartile: "Q1"
  },
  {
    id: 3,
    title: "Systematic Evaluation of Open Scholarly Metadata: Crossref, OpenAlex, and Scopus Comparison",
    authors: "Visser, M., van Eck, N. J., & Waltman, L.",
    year: 2021,
    journal: "Quantitative Science Studies",
    doi: "10.1162/qss_a_00112",
    url: "https://doi.org/10.1162/qss_a_00112",
    citation_count: 310,
    citation_source: "OpenAlex Verified",
    abstract: "Comprehensive bibliometric comparison demonstrating coverage depth, citation linkage latency, and DOI provenance across major open metadata providers.",
    verification_status: "verified",
    relevance_score: 0.96,
    quartile: "Q1"
  }
];
