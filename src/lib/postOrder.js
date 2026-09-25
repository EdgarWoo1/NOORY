// 목록 노출 순서와 페이지 크기. 목록(List)과 상세글의 이전/다음 글(PostDetail)이
// 같은 순서를 쓰도록 한곳에 둔다.

const PER_PAGE_BY_CATEGORY = { 독후감: 9 }
const DEFAULT_PER_PAGE = 8

export const perPageOf = (category) => PER_PAGE_BY_CATEGORY[category] ?? DEFAULT_PER_PAGE

// 독후감 목록에서 민음사 세계문학전집 수록작을 앞쪽(1~2페이지)에 고정 노출한다.
// 배열 순서 = 노출 우선순위. 앞 11개는 세계문학전집이 확실한 작품,
// 뒤 4개는 판본 여부가 애매하지만 우선 노출하기로 한 작품이다.
const PINNED_SLUGS = [
  'etc_57_괴테와의대화1',
  'etc_8_네루다의 우편배달부',
  'etc_16_미겔스트리트',
  'etc_25_수레바퀴아래서',
  'etc_30_올리버트위스트',
  'etc_31_말',
  'etc_43_달과6펜스',
  'etc_45_면도날',
  'etc_46_이방인',
  'etc_51_위대한 개츠비',
  'etc_52_그리스인조르바',
  'etc_54_파우스트',
  // ↓ 여기부터는 세계문학전집 판본 여부가 애매하나 우선 노출 (위 11개 뒤)
  'etc_6_월든',
  'etc_9_소망 없는 불행',
  'etc_37_노르웨이의숲',
  'etc_55_차라투스트라',
  'etc_56_구토',
]

// 날짜와 무관하게 항상 목록 맨 뒤(마지막 페이지)로 보낼 글.
// 최근 글이지만 뒤쪽에 두고 싶은 경우(예: 추천 리스트)에 사용한다.
// 상단 고정(PINNED_SLUGS)과 달리 카테고리를 가리지 않고 적용한다.
const PINNED_LAST_SLUGS = ['etc_58_2026클로드추천리스트', 'etc_60_데일카네기자기관리론', 'etc_61_몰입', 'etc_62_평일도인생이니까']

// 상단 고정 작품은 우선순위 순서로 앞에, 하단 고정 글은 맨 뒤에 배치하고,
// 나머지는 기존(날짜) 순서를 유지한다.
// slug 한글이 NFC/NFD로 섞일 수 있어 비교 시 양쪽을 NFC로 정규화한다.
export function pinFeatured(posts, category) {
  // 민음사 상단 고정은 독후감 목록에서만 의미가 있다.
  const topSlugs = category === '독후감' ? PINNED_SLUGS : []
  const topRank = new Map(topSlugs.map((slug, i) => [slug.normalize('NFC'), i]))
  const lastRank = new Map(PINNED_LAST_SLUGS.map((slug, i) => [slug.normalize('NFC'), i]))
  const NORMAL = 1_000_000
  const LAST_BASE = 2_000_000
  const rankOf = (p) => {
    const slug = (p.slug || '').normalize('NFC')
    if (topRank.has(slug)) return topRank.get(slug)
    if (lastRank.has(slug)) return LAST_BASE + lastRank.get(slug)
    return NORMAL
  }
  // Array.prototype.sort는 안정 정렬이므로 동순위(NORMAL)는 원래 순서(날짜순)가 유지된다.
  return [...posts].sort((a, b) => rankOf(a) - rankOf(b))
}
