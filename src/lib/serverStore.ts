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
    title: "Retrieval-Augmented Generation for Scientific Hypothesis Formulation",
    mode: "literature_review",
    status: "completed",
    target_journal: "Nature Artificial Intelligence",
    citation_style: "APA 7th",
    created_at: new Date(Date.now() - 43200000).toISOString(),
    has_document: false,
    total_issues: 0,
    open_issues: 0,
    has_review: true,
    review: {
      id: 2,
      title: "Retrieval-Augmented Generation for Scientific Hypothesis Formulation",
      domain: "Artificial Intelligence & Computer Science",
      target_journal: "Nature Artificial Intelligence",
      citation_style: "APA 7th",
      word_count: 580,
      created_at: new Date().toISOString(),
      disclaimer: "Academic Integrity Note: This structured literature review synthesizes verified publications and must be critically reviewed and validated by the primary author prior to formal manuscript submission.",
      sections: [
        {
          section_number: 1,
          title: "Theoretical Foundations of Retrieval-Augmented Scientific Reasoning",
          content: "The emergence of Retrieval-Augmented Generation (RAG) marks a pivotal paradigm shift in automated literature synthesis. Vaswani et al. (2021) established the computational foundation of self-attention architectures, demonstrating that global cross-attention mechanisms efficiently encode intricate dependency graphs. In scientific contexts, however, static parameter weights suffer from catastrophic hallucination when exposed to fine-grained empirical data. Gao et al. (2024) formulated an integrated retrieval-generation framework that dynamically grounds inference by pulling verified external vectors from indexed scientific corpora.",
          sources_cited: ["Attention Is All You Need", "A Survey on Retrieval-Augmented Generation"]
        },
        {
          section_number: 2,
          title: "Contemporary Empirical Evidence and Comparative Benchmarks",
          content: "Recent empirical studies published between 2022 and 2025 validate that dynamic retrieval markedly mitigates factual degradation across biomedical and mathematical benchmarks. Wang et al. (2023) evaluated generative models across 1,200 scientific discovery pipelines, reporting a 37% improvement in bibliographic precision when hybrid dense-sparse retrieval was utilized. Conversely, Sharma et al. (2022) observed that ungrounded models frequently generate plausible-sounding yet completely fabricated digital object identifiers, reinforcing the urgent imperative for automated citation verification prior to manuscript submission.",
          sources_cited: ["Scientific Discovery in the Age of Generative AI", "Citation Inconsistencies and Referencing Accuracy"]
        },
        {
          section_number: 3,
          title: "Methodological Divergence, Conflicting Findings, and Research Limitations",
          content: "Despite promising empirical results, existing literature exhibits non-trivial methodological divergence regarding optimal chunking strategies and semantic reranking. Visser et al. (2021) demonstrated that open metadata providers (Crossref, OpenAlex) differ substantially in coverage depth and citation linkage latency compared to proprietary databases like Scopus. Consequently, systems trained exclusively on single-provider indexes risk systematic coverage bias, particularly across non-English and regional scholarly journals.",
          sources_cited: ["Systematic Evaluation of Open Scholarly Metadata"]
        }
      ],
      research_gaps: [
        {
          gap_title: "Lack of Multi-Repository Disambiguation Benchmarks",
          description: "Current literature predominantly evaluates retrieval accuracy on isolated datasets rather than federated multi-registry environments.",
          supporting_evidence: "Demonstrated across Visser et al. (2021) and Gao et al. (2024)."
        },
        {
          gap_title: "Absence of Longitudinal Tracking for Outdated Scholarly Claims",
          description: "Generative models lack temporal decay mechanisms to deprecate retracted or obsolete scientific claims automatically.",
          supporting_evidence: "Highlighted as a critical bottleneck in Wang et al. (2023)."
        }
      ],
      references: [
        "Gao, Y., Xiong, Y., Gao, X., Jia, K., & Pan, J. (2024). A Survey on Retrieval-Augmented Generation for Large Language Models. IEEE Transactions on Knowledge and Data Engineering. https://doi.org/10.1109/TKDE.2024.3364789",
        "Sharma, P., Martinez, R., & Henderson, C. (2022). Citation Inconsistencies and Referencing Accuracy in Contemporary Academic Publishing. Journal of Informetrics. https://doi.org/10.1016/j.joi.2022.101284",
        "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., & Jones, L. (2021). Attention Is All You Need: Architectural Advancements. Advances in Neural Information Processing Systems. https://doi.org/10.5555/3295222.3295349",
        "Visser, M., van Eck, N. J., & Waltman, L. (2021). Systematic Evaluation of Open Scholarly Metadata: Crossref, OpenAlex, and Scopus Comparison. Quantitative Science Studies. https://doi.org/10.1162/qss_a_00112",
        "Wang, H., Fu, T., Du, Y., Gao, W., & Huang, K. (2023). Scientific Discovery in the Age of Generative AI: Opportunities and Methodological Challenges. Nature Artificial Intelligence. https://doi.org/10.1038/s42256-023-00712-4"
      ]
    }
  }
];

export const serverSavedSources: any[] = [
  {
    id: 1,
    title: "Attention Is All You Need: Architectural Advancements and Large Language Models",
    authors: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L.",
    year: 2021,
    journal: "Advances in Neural Information Processing Systems",
    doi: "10.5555/3295222.3295349",
    url: "https://doi.org/10.5555/3295222.3295349",
    citation_count: 89450,
    citation_source: "OpenAlex",
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, an architecture eschewing recurrence and entirely relying on an attention mechanism to draw global dependencies between input and output.",
    verification_status: "verified",
    relevance_score: 0.95,
    quartile: "Q1"
  },
  {
    id: 2,
    title: "A Survey on Retrieval-Augmented Generation for Large Language Models",
    authors: "Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J.",
    year: 2024,
    journal: "IEEE Transactions on Knowledge and Data Engineering",
    doi: "10.1109/TKDE.2024.3364789",
    url: "https://doi.org/10.1109/TKDE.2024.3364789",
    citation_count: 412,
    citation_source: "OpenAlex",
    abstract: "Large Language Models (LLMs) have demonstrated impressive capabilities but suffer from hallucinations and outdated domain knowledge.",
    verification_status: "verified",
    relevance_score: 0.92,
    quartile: "Q1"
  }
];
