// "A", "A and B", "A, B and C"
export function listTitles(titles: string[]) {
  return titles.length <= 1 ? (titles[0] ?? "") : `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
}
