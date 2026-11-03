import { NextResponse } from "next/server";
import { serverProjects } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const projectId = parseInt(params.id, 10);
  const project = serverProjects.find((p) => p.id === projectId) || serverProjects[0];
  const review = project?.review;

  let bibtex = `@article{vaswani2021attention,
  author = {Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion},
  title = {Attention Is All You Need},
  journal = {Advances in Neural Information Processing Systems},
  year = {2021},
  doi = {10.5555/3295222.3295349}
}

@article{sharma2022citation,
  author = {Sharma, Priya and Martinez, Roberto and Henderson, Claire},
  title = {Citation Inconsistencies and Referencing Accuracy in Contemporary Academic Publishing},
  journal = {Journal of Informetrics},
  year = {2022},
  doi = {10.1016/j.joi.2022.101284}
}

@article{gao2024survey,
  author = {Gao, Yunfan and Xiong, Yun and Gao, Xinyu and Jia, Kang and Pan, Jinzhu},
  title = {A Survey on Retrieval-Augmented Generation for Large Language Models},
  journal = {IEEE Transactions on Knowledge and Data Engineering},
  year = {2024},
  doi = {10.1109/TKDE.2024.3364789}
}
`;

  return new Response(bibtex, {
    status: 200,
    headers: {
      "Content-Type": "application/x-bibtex; charset=utf-8",
      "Content-Disposition": `attachment; filename="references_${projectId}.bib"`,
    },
  });
}
