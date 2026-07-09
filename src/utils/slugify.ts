export const getExpSlug = (exp: { company: string; id: number }) =>
  `${exp.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${exp.id}`;

export const getProjSlug = (proj: { title: string; id: number }) =>
  `${proj.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${proj.id}`;
