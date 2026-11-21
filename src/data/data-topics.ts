// Topic groups for data tables (review #41): every table picks ONE coherent topic and
// its columns all come from that group — never a mixed "con bò, quả chuối, quả táo"
// table. The story names the topic (its title), so the child always knows what the
// table is about. The class table (Nam/Nữ/Cả lớp) only ever uses the 'likes' group:
// columns must be something boys and girls can like, choose or join.
export const HEADER_GROUPS = {
  fruits: ['i:apple', 'i:banana', 'i:orange', 'i:mango'],
  farm: ['i:dog', 'i:cat', 'i:chicken', 'i:duck', 'i:pig', 'i:cow'],
  books: ['l:group_1', 'l:group_2', 'l:group_3'],
  toys: ['i:ball', 'i:doll', 'i:car'],
  likes: ['i:swim', 'i:chess', 'i:draw'],
} as const;

export type HeaderGroup = keyof typeof HEADER_GROUPS;

/** The story key (the table's title) for each topic group. */
export const TABLE_STORY: Record<HeaderGroup, string> = {
  fruits: 'tableStoryFruits',
  farm: 'tableStoryFarm',
  books: 'tableStoryBooks',
  toys: 'tableStoryToys',
  likes: 'tableStoryLikes',
};

/** The single topic group every header belongs to, or undefined when mixed. */
export function groupOfHeaders(headers: readonly string[]): HeaderGroup | undefined {
  return (Object.keys(HEADER_GROUPS) as HeaderGroup[]).find((g) =>
    headers.every((h) => (HEADER_GROUPS[g] as readonly string[]).includes(h)),
  );
}
