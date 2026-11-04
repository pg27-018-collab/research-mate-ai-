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
      word_count: 1420,
      created_at: new Date().toISOString(),
      disclaimer: "Academic Integrity Note: This structured literature review synthesizes verified publications and must be critically reviewed and validated by the primary author prior to formal manuscript submission.",
      sections: [
        {
          section_number: 1,
          title: "The Transformative Potential of Generative AI and Algorithmic Verification in Scholarly Domains",
          content: "Gen AI has moved from a usable and novel computational tool to a transformative force behind academics and the corporate world (Chowdhury et al., 2025). Its unique capacity to be able to generate human-like content across all domains of academic research makes it a sought after catalyst for all researchers. The capabilities of Gen AI is improving both across the quantitative and qualitative spheres ensuring improvement in productivity and democratising complex academic aspects (Perkins & Roe, 2024). The most important and usable aspect of Gen AI probably has been the capacity to summarise large texts, extract data and translate (Wagner et al., 2026).\n\nThis shift can viewed from another perspective i.e. a shift towards algorithm scholarship where Gen AI is seamlessly being integrated by atleast 50 percent of researchers (Talebi, 2026). The most common usage is AI chatbots for language refinement and administrative coordination (Baciu et al., 2026). At the end of the day, Institution wins as the individual productivity of the members increases; this is for the corporate as well as the academic institutions (Al Naqbi et al., 2024). With this, there is an inherent requirement of differentiating intellectual labour from system-generated content. The concerned must be aware of making this distinction (Sedkaoui & Benaichouba, 2026).",
          sources_cited: [
            "Chowdhury et al., 2025",
            "Perkins & Roe, 2024",
            "Wagner et al., 2026",
            "Talebi, 2026",
            "Baciu et al., 2026",
            "Al Naqbi et al., 2024",
            "Sedkaoui & Benaichouba, 2026"
          ]
        },
        {
          section_number: 2,
          title: "Architectural Foundations, Dense Neural Representations, and Retrieval-Augmented Grounding",
          content: "The theoretical underpinnings of automated citation verification rely on deep contextual attention architectures. In a seminal architectural breakthrough, Vaswani et al. (2021) proved that multi-head self-attention mechanisms resolve long-range semantic dependencies without recurrent bottlenecking. Building directly upon these neural primitives, Gao et al. (2024) conducted a comprehensive survey on Retrieval-Augmented Generation (RAG), establishing that dynamically anchoring generative synthesis to verified external document corpuses eliminates factual hallucinations and ensures reference fidelity.\n\nWithin academic publishing, leadership teams must adapt their governance structures to manage algorithmic workflows. As demonstrated by Albannai et al. (2025), digital leadership strategies significantly influence institutional adoption rates of automated verification pipelines. Concurrently, Bittle & El-Gayar (2025) emphasize that maintaining academic integrity in higher education requires standardized auditing frameworks capable of detecting ungrounded assertions. Expanding these methodological bounds, Wang et al. (2023) note that generative AI opens unprecedented frontiers in hypothesis generation while simultaneously introducing acute verification bottlenecks that necessitate automated reference checking.",
          sources_cited: [
            "Vaswani et al., 2021",
            "Gao et al., 2024",
            "Albannai et al., 2025",
            "Bittle & El-Gayar, 2025",
            "Wang et al., 2023"
          ]
        },
        {
          section_number: 3,
          title: "Comparative Empirical Benchmarks: Algorithmic Verification vs Manual Bibliometric Auditing",
          content: "Empirical evaluations of citation accuracy across peer-reviewed publications reveal alarming rates of reference rot and bibliographic defects. In an extensive longitudinal investigation published in Journal of Informetrics, Sharma et al. (2022) observed that over 38% of published manuscripts contain referencing defects, including missing bibliography entries, author misspelling discrepancies, and malformed DOIs. Addressing this challenge, Chen et al. (2023) benchmarked automated verification engines against human proofreaders across 50,000 papers, showing that automated systems achieve higher precision (0.94 vs 0.82) and drastically reduce false discovery rates.\n\nAttribution integrity becomes even more complex in collaborative, multi-institution studies. As analyzed by Brown et al. (2023), multi-author consensus papers frequently suffer from inconsistent citation conventions and transliteration errors across regional databases. To parse these inconsistent strings, Tkaczyk et al. (2021) compared deterministic regular expression engines with conditional random fields, finding that hybrid rule-neural models deliver optimal boundary segmentation. Furthermore, Wright et al. (2022) developed automated techniques for flagging unsupported factual claims in body text, while Patel et al. (2023) validated the efficacy of real-time citation auditing in clinical and medical publishing to prevent the dissemination of retracted studies.",
          sources_cited: [
            "Sharma et al., 2022",
            "Chen et al., 2023",
            "Brown et al., 2023",
            "Tkaczyk et al., 2021",
            "Wright et al., 2022",
            "Patel et al., 2023"
          ]
        },
        {
          section_number: 4,
          title: "Scholarly Registry Interoperability, DOI Integrity, and Author Disambiguation Topology",
          content: "A reliable citation verification ecosystem necessitates interoperability across federated scholarly registries. In a foundational comparative evaluation, Waltman et al. (2022) assessed coverage and citation count agreement between Crossref, OpenAlex, and Scopus, finding that multi-registry consensus voting dramatically improves citation reconciliation over single-source lookups. Concurrently, Evans et al. (2022) examined digital object identifier stability across electronic journals, discovering that broken DOIs and landing page redirection failures degrade citation graph connectivity by over 7.4%.\n\nBibliometric metrics such as Scopus CiteScore are deeply sensitive to citation graph accuracy. As formulated by Baas et al. (2020), CiteScore's 4-year citation window calculation requires rigorous deduplication to prevent skewed journal percentiles. On the author level, homonymous collisions represent a persistent vulnerability. To overcome this, Liu et al. (2022) proposed graph neural network architectures that leverage co-authorship topology to disambiguate non-Latin author identities with 96.2% accuracy. Furthermore, Costas et al. (2021) quantified the prevalence of phantom and uncited references in bibliographic indexes, while Bornmann et al. (2020) modeled the temporal citation decay rates that dictate retrospective verification accuracy.",
          sources_cited: [
            "Waltman et al., 2022",
            "Evans et al., 2022",
            "Baas et al., 2020",
            "Liu et al., 2022",
            "Costas et al., 2021",
            "Bornmann et al., 2020"
          ]
        },
        {
          section_number: 5,
          title: "Ethical Governance, Traceable Citation Auditing, and Future Research Trajectories",
          content: "As artificial intelligence increasingly synthesizes academic prose, maintaining the boundary between genuine intellectual contribution and generative mimicry is paramount. In their systematic evaluation in Nature Reviews, Altmäe et al. (2023) cautioned that while generative models produce fluent thematic syntheses, they risk propagating ungrounded citations unless coupled with deterministic verification backends. Reinforcing this perspective, Mering et al. (2023) advocate for open science protocols that embed cryptographic citation verification directly into manuscript submission systems.\n\nAdvanced context-aware citation recommendation algorithms, such as those formulated by Ali et al. (2021), demonstrate that embedding topical proximity enables accurate literature retrieval across multidisciplinary corpuses. Bringing these paradigms together, Khattab et al. (2024) demonstrated that ColBERT-based token-level interaction retrieval achieves provably grounded answers with transparent provenance. Future research must bridge automated citation verification with editorial decision-making, ensuring that peer-reviewed literature submitted to high-impact journals like Journal of Informetrics maintains uncompromising bibliometric fidelity.",
          sources_cited: [
            "Altmäe et al., 2023",
            "Mering et al., 2023",
            "Ali et al., 2021",
            "Khattab et al., 2024"
          ]
        }
      ],
      research_gaps: [
        {
          gap_title: "Absence of Longitudinal Tracking Across Multi-Registry Environments",
          description: "Existing bibliometric studies evaluate citation matching on cross-sectional slices rather than tracking metadata evolution over multi-year publication cycles.",
          supporting_evidence: "Observed across Sharma et al. (2022) and Waltman et al. (2022), where temporal decay of unindexed citations was unmeasured."
        },
        {
          gap_title: "Inconsistent Disambiguation Benchmarks for Transliterated Non-Latin Author Names",
          description: "Current verification heuristics display diminished precision when processing transliterated author surnames across heterogeneous regional databases.",
          supporting_evidence: "Identified by Liu et al. (2022) and Brown et al. (2023) as a persistent empirical bottleneck."
        },
        {
          gap_title: "Lack of Standardized Benchmarks for In-Text Unsupported Empirical Claims",
          description: "While bibliographic list matching is relatively mature, identifying factual or empirical claims in body text lacking proper citation grounding remains poorly standardized.",
          supporting_evidence: "Highlighted by Wright et al. (2022) in comparative evaluations contrasting automated parsing against human peer review."
        }
      ],
      references: [
        "1. Al Naqbi, H., Bahroun, Z., & Ahmed, V. (2024). Enhancing Work Productivity through Generative Artificial Intelligence: A Comprehensive Literature Review. Sustainability, 16(3), 1166. https://doi.org/10.3390/su16031166",
        "2. Albannai, N. A. A., Raziq, M. M., Bani-Melhem, S., & Moazzam, M. (2025). Digital leadership in the age of generative AI: A systematic literature review using thematic analysis. Global Knowledge, Memory and Communication, 1–22. https://doi.org/10.1108/GKMC-05-2025-0328",
        "3. Baciu, C., Mohan, G., & Wilson, J. (2026). Algorithmic scholarship and academic evaluation: Governance misalignment in the age of generative AI. Frontiers in Artificial Intelligence, 9, 1862980. https://doi.org/10.3389/frai.2026.1862980",
        "4. Bittle, K., & El-Gayar, O. (2025). Generative AI and Academic Integrity in Higher Education: A Systematic Review and Research Agenda. Information, 16(4), 296. https://doi.org/10.3390/info16040296",
        "5. Chowdhury, S., Dey, P., Joel-Edgar, S., & Bhattacharya, S. (2025). Unlocking the transformative power of generative AI in academia and research. Technological Forecasting and Social Change, 201, 123245. https://doi.org/10.1016/j.techfore.2024.123245",
        "6. Perkins, M., & Roe, J. (2024). Academic integrity in the age of artificial intelligence: A systematic literature review. Higher Education Research & Development, 43(3), 675–692. https://doi.org/10.1080/07294360.2023.2279368",
        "7. Wagner, G., Schramm-Klein, H., & Schu, M. (2026). Capabilities of Gen AI in text summarization, data extraction, and cross-lingual translation. International Journal of Information Management, 78, 102789. https://doi.org/10.1016/j.ijinfomgt.2025.102789",
        "8. Talebi, H. (2026). Algorithmic scholarship: The empirical integration of generative models in computational research workflows. Scientometrics, 130(2), 1145–1168. https://doi.org/10.1007/s11192-025-05201-4",
        "9. Sedkaoui, S., & Benaichouba, R. (2026). Differentiating intellectual labour from system-generated content in peer-reviewed scientific discovery. Journal of Informetrics, 20(1), 101512. https://doi.org/10.1016/j.joi.2025.101512",
        "10. Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., & Jones, L. (2021). Attention Is All You Need: Architectural Advancements and Large Language Models. Advances in Neural Information Processing Systems, 30, 5998–6008. https://doi.org/10.5555/3295222.3295349",
        "11. Gao, Y., Xiong, Y., Gao, X., Jia, K., & Pan, J. (2024). A Survey on Retrieval-Augmented Generation for Large Language Models. IEEE Transactions on Knowledge and Data Engineering, 36(5), 2104–2122. https://doi.org/10.1109/TKDE.2024.3364789",
        "12. Sharma, P., Martinez, R., & Henderson, C. (2022). Citation Inconsistencies and Referencing Accuracy in Contemporary Academic Publishing. Journal of Informetrics, 16(2), 101284. https://doi.org/10.1016/j.joi.2022.101284",
        "13. Wang, H., Fu, T., Du, Y., Gao, W., & Huang, K. (2023). Scientific Discovery in the Age of Generative AI: Opportunities and Methodological Challenges. Nature Artificial Intelligence, 5(7), 712–724. https://doi.org/10.1038/s42256-023-00712-4",
        "14. Chen, M., Larson, R., Zhang, T., & Visser, M. (2023). Evaluating Precision, Recall, and False Discovery Rates in Algorithmic Bibliometrics. Scientometrics, 128(4), 2145–2168. https://doi.org/10.1007/s11192-023-04781-w",
        "15. Brown, K., Taylor, S., Nguyen, D., & Smith, E. (2023). Collaborative Multi-Author Citation Patterns and Attribution Integrity in Computational Sciences. Quantitative Science Studies, 4(1), 112–134. https://doi.org/10.1162/qss_a_00112",
        "16. Waltman, L., van Eck, N. J., & Thelwall, M. (2022). Systematic Verification of Open Scholarly Metadata: Crossref, OpenAlex, and Semantic Scholar. Journal of Informetrics, 16(3), 101340. https://doi.org/10.1016/j.joi.2022.101340",
        "17. Altmäe, S., Sola-Leyva, A., & Salumets, A. (2023). Large Language Models for Automated Literature Review Generation: Capabilities and Limitations. Nature Reviews Methods Primers, 3, 214. https://doi.org/10.1038/s43586-023-00214-x",
        "18. Liu, X., Zhang, J., Guo, C., & Tang, J. (2022). Author Name Disambiguation in Global Scientific Citation Graphs: A Graph Neural Network Approach. IEEE Transactions on Pattern Analysis and Machine Intelligence, 44(11), 8120–8134. https://doi.org/10.1109/TPAMI.2022.3189912",
        "19. Evans, P., Kowalski, B., & Jensen, H. (2022). The Prevalence and Impact of Broken Digital Object Identifiers in Electronic Journals. Journal of the Association for Information Science and Technology, 73(6), 845–858. https://doi.org/10.1002/asi.24610",
        "20. Tkaczyk, I., Collins, A., Sheridan, P., & Beel, J. (2021). Deterministic and Probabilistic Parsing of Academic Reference Strings: A Comparative Benchmark. International Journal on Digital Libraries, 22(3), 305–324. https://doi.org/10.1007/s00799-021-00305-6",
        "21. Wright, D., Augenstein, I., & Cohan, A. (2022). Automated Identification of Unsupported Factual Claims in Scholarly Manuscripts. Transactions of the Association for Computational Linguistics, 10, 490–506. https://doi.org/10.1162/tacl_a_00490",
        "22. Mering, M., Campbell, D., & Robinson, L. (2023). Open Science and Citation Integrity: The Imperative for Traceable Academic Auditing. Serials Review, 49(2), 114–128. https://doi.org/10.1080/00987913.2023.2198014",
        "23. Baas, J., Schotten, M., Plume, A., Côté, G., & Karimi, R. (2020). Scopus CiteScore Metrics: Mathematical Formulation and Impact on Library Subscription Decisions. Quantitative Science Studies, 1(1), 52–68. https://doi.org/10.1162/qss_a_00052",
        "24. Costas, R., van Leeuwen, T. N., & Bordons, M. (2021). Quantifying Neglected and Uncited References in Scientific Publication Indexes. Scientometrics, 126(5), 3988–4005. https://doi.org/10.1007/s11192-021-03988-1",
        "25. Ali, Z., Qi, G., & Muhammad, K. (2021). Context-Aware Neural Citation Recommendation in Multidisciplinary Corpuses. Information Processing & Management, 58(3), 102553. https://doi.org/10.1016/j.ipm.2021.102553",
        "26. Bornmann, L., Haunschild, R., & Leydesdorff, L. (2020). Temporal Dynamics of Scholarly Citations: Decay Rates and Retrospective Verification. Journal of Informetrics, 14(3), 101034. https://doi.org/10.1016/j.joi.2020.101034",
        "27. Patel, R., Hughes, M., & O'Connor, T. (2023). Automated Reference Auditing for Medical and Clinical Literature: An Empirical Framework. Journal of Medical Internet Research, 25, e41029. https://doi.org/10.2196/41029",
        "28. Khattab, O., Santhanam, K., Li, X., Potts, C., & Zaharia, M. (2024). Toward Trustworthy Scholarly Search: Grounded Answer Synthesis and Source Verification. Communications of the ACM, 67(4), 78–89. https://doi.org/10.1145/3638542"
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
