export const navigationCatalog = [
  {
    id: "page-transition",
    name: "Page transition",
    group: "Navigation",
    component: "PageTransition",
    addedAt: "2026-10-23",
    description:
      "목록의 이미지와 제목이 상세 화면으로 이어집니다. 실제 상태 전환과 포커스 복귀, 브라우저 fallback.",
    tags: ["shared element", "view transition", "route", "화면 전환"],
  },
  {
    id: "dynamic-status-island",
    name: "Dynamic status island",
    group: "Feedback",
    component: "DynamicStatusIsland",
    addedAt: "2026-10-23",
    description:
      "작업의 상태와 진행률을 담는 작은 캡슐. 펼치면 설명과 실제 액션이 나타납니다.",
    tags: ["task", "progress", "capsule", "상태"],
  },
  {
    id: "animated-mega-menu",
    name: "Animated mega menu",
    group: "Navigation",
    component: "AnimatedMegaMenu",
    addedAt: "2026-10-23",
    description:
      "메뉴 섹션 사이를 부드럽게 이동합니다. 네이티브 링크·방향키·Escape·외부 클릭 지원.",
    tags: ["menu", "links", "hover", "메뉴"],
  },
  {
    id: "sortable-grid",
    name: "Sortable grid",
    group: "Data display",
    component: "SortableGrid",
    addedAt: "2026-10-23",
    description:
      "격자 항목을 손잡이로 옮깁니다. 실제 2차원 드래그와 Space·방향키 재정렬.",
    tags: ["drag", "reorder", "keyboard", "격자"],
  },
  {
    id: "card-navigation",
    name: "Card navigation",
    group: "Navigation",
    component: "CardNavigation",
    addedAt: "2026-10-23",
    description:
      "탐색 메뉴를 주제별 카드로 펼칩니다. 실제 링크·접기·Escape 포커스 복귀.",
    tags: ["menu", "cards", "links", "탐색"],
  },
  {
    id: "scroll-stack",
    name: "Scroll stack",
    group: "Navigation",
    component: "ScrollStack",
    addedAt: "2026-10-23",
    description:
      "스크롤에 맞춰 카드가 차곡차곡 쌓입니다. 네이티브 sticky, 읽기 순서와 중첩 스크롤 보존.",
    tags: ["sticky", "scroll", "cards", "스크롤"],
  },
  {
    id: "sticky-scroll-story",
    name: "Sticky scroll story",
    group: "Data display",
    component: "StickyScrollStory",
    addedAt: "2026-10-23",
    description:
      "설명을 읽으면 옆의 미리보기가 함께 변합니다. 수동 선택과 모바일 인라인 대안.",
    tags: ["story", "scroll", "preview", "제품 소개"],
  },
  {
    id: "footer-reveal",
    name: "Footer reveal",
    group: "Navigation",
    component: "FooterReveal",
    addedAt: "2026-10-23",
    description:
      "본문 아래에서 푸터가 드러납니다. 링크와 콘텐츠의 문서 순서를 유지하는 네이티브 스크롤.",
    tags: ["footer", "scroll", "reveal", "푸터"],
  },
  {
    id: "scroll-expand-media",
    name: "Scroll expand media",
    group: "Visual effects",
    component: "ScrollExpandMedia",
    addedAt: "2026-10-23",
    description:
      "화면에 들어온 미디어 프레임이 스크롤을 따라 넓어집니다. 중첩 컨테이너와 모션 감소 지원.",
    tags: ["image", "scroll", "scale", "미디어"],
  },
  {
    id: "coverflow-carousel",
    name: "Coverflow carousel",
    group: "Data display",
    component: "CoverflowCarousel",
    addedAt: "2026-10-23",
    description:
      "중앙 항목에 집중하는 깊이 있는 갤러리. 스와이프·방향키·경계·빈 상태.",
    tags: ["gallery", "3d", "carousel", "갤러리"],
  },
] as const;
export const navigationExamples = {
  "page-transition": `<PageTransition pages={[{ id: 'project', title: 'A study in form', media: <img src="/project.jpg" alt="A study in form" />, content: <p>Project details</p> }]} value={projectId} onValueChange={setProjectId} />`,
  "dynamic-status-island": `<DynamicStatusIsland status="working" title="Preparing your collection" detail="Keeping the details in order." progress={42} actions={<Button onClick={cancelTask}>Cancel</Button>} />`,
  "animated-mega-menu": `<AnimatedMegaMenu items={[{ id: 'build', label: 'Build', links: [{ id: 'docs', label: 'Documentation', href: '/docs' }] }]} />`,
  "sortable-grid": `<SortableGrid items={[{ id: 'notes', label: 'Notes', content: <p>Field notes</p> }, { id: 'photos', label: 'Photos', content: <p>Weekend photos</p> }]} order={order} onOrderChange={setOrder} />`,
  "card-navigation": `<CardNavigation groups={[{ id: 'explore', title: 'Explore', links: [{ id: 'work', label: 'Selected work', href: '/work' }] }]} />`,
  "scroll-stack": `<ScrollStack items={[{ id: 'one', title: 'A small idea', content: <p>Start somewhere simple.</p> }, { id: 'two', title: 'Give it space', content: <p>Let the idea breathe.</p> }]} top={16} offset={20} />`,
  "sticky-scroll-story": `<StickyScrollStory steps={[{ id: 'shape', title: 'Find the shape', description: <p>A small beginning.</p>, preview: <img src="/shape.jpg" alt="The first sketch" /> }]} />`,
  "footer-reveal": `<FooterReveal footer={<><h2>Let’s make something.</h2><a href="/contact">Get in touch</a></>}><main>{pageContent}</main></FooterReveal>`,
  "scroll-expand-media": `<ScrollExpandMedia caption="A wider perspective" minScale={0.72}><img src="/landscape.jpg" alt="The coast at dawn" /></ScrollExpandMedia>`,
  "coverflow-carousel": `<CoverflowCarousel items={[{ id: 'one', title: 'Form', content: <img src="/form.jpg" alt="A study in form" /> }, { id: 'two', title: 'Space', content: <img src="/space.jpg" alt="An open room" /> }]} loop />`,
} satisfies Record<string, string>;
