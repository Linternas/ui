export const interactionCatalog = [
  {
    id: "folder",
    name: "Folder",
    group: "Display",
    description:
      "A little space for the things you collect. Hover to fan out, click to open.",
    component: "Folder",
  },
  {
    id: "code-block",
    name: "Code block",
    group: "Display",
    description:
      "Readable syntax, deliberate highlights, and code you can take with you.",
    component: "CodeBlock",
  },
  {
    id: "gravity-letters",
    name: "Gravity letters",
    group: "Display",
    description:
      "Letters with a little weight. Click, hold, and let them find their place.",
    component: "GravityLetters",
  },
  {
    id: "github-activity",
    name: "GitHub activity",
    group: "Display",
    description:
      "A year of small steps, with a closer look at where they happened.",
    component: "GithubActivity",
  },
  {
    id: "step-player",
    name: "Step player",
    group: "Display",
    description: "Play, pause, jump ahead. A sequence that moves at your pace.",
    component: "StepPlayer",
  },
  {
    id: "animated-counter",
    name: "Animated counter",
    group: "Display",
    description:
      "Numbers that roll into their next place, one digit at a time.",
    component: "AnimatedCounter",
  },
  {
    id: "voice-note",
    name: "Voice note",
    group: "Display",
    description:
      "A quiet waveform. Press play, scrub through, or change the pace.",
    component: "VoiceNote",
  },
  {
    id: "faq",
    name: "FAQ",
    group: "Display",
    description: "Questions and answers, with the ease of a conversation.",
    component: "Faq",
  },
  {
    id: "fluid-orb",
    name: "Fluid orb",
    group: "AI",
    description:
      "Color in constant conversation. A flowing, softly shaded WebGL sphere.",
    component: "FluidOrb",
  },
  {
    id: "grid-reveal",
    name: "Grid reveal",
    group: "AI",
    description:
      "From possibility to picture. A grid resolves into the finished image.",
    component: "GridReveal",
  },
  {
    id: "matrix-orb",
    name: "Matrix orb",
    group: "AI",
    description:
      "A constellation of dots, listening, thinking, or simply being.",
    component: "MatrixOrb",
  },
  {
    id: "web-search",
    name: "Web search",
    group: "AI",
    description:
      "Sources in view. Open the cards and follow an answer back to its origin.",
    component: "WebSearch",
  },
  {
    id: "ai-status",
    name: "Inline AI status",
    group: "AI",
    description:
      "A small signal for the work in progress, from first thought to final word.",
    component: "AiStatus",
  },
  {
    id: "bounce-sidebar",
    name: "Bounce sidebar",
    group: "Navigation",
    description:
      "A familiar list, with an indicator that lands with a little spring.",
    component: "BounceSidebar",
  },
  {
    id: "hook-sidebar",
    name: "Hook sidebar",
    group: "Navigation",
    description: "A dashed rail that bends toward the place you have chosen.",
    component: "HookSidebar",
  },
  {
    id: "proximity-sidebar",
    name: "Proximity sidebar",
    group: "Navigation",
    description:
      "A navigation rail that responds before you click. Move a little closer.",
    component: "ProximitySidebar",
  },
  {
    id: "scroll-progress",
    name: "Scroll progress",
    group: "Navigation",
    description:
      "How far you have come, and somewhere to go next. Scroll, open, jump.",
    component: "ScrollProgress",
  },
  {
    id: "rail-toc",
    name: "Rail TOC",
    group: "Navigation",
    description: "A small paper guide following the shape of a longer story.",
    component: "RailToc",
  },
  {
    id: "gooey-nav",
    name: "Gooey nav",
    group: "Navigation",
    description:
      "A soft, stretching selection that finds its own place in the group.",
    component: "GooeyNav",
  },
  {
    id: "duration-picker",
    name: "Duration picker",
    group: "Inputs",
    description:
      "A compact stretch of time. Open the segments, edit, and bring them together.",
    component: "DurationPicker",
  },
  {
    id: "otp-input",
    name: "OTP input",
    group: "Inputs",
    description:
      "One code, one input. Type, paste, or autofill into a row of animated slots.",
    component: "OtpInput",
  },
  {
    id: "delete-button",
    name: "Delete button",
    group: "Inputs",
    description:
      "A moment to reconsider. Confirmation happens right where you clicked.",
    component: "DeleteButton",
  },
  {
    id: "task-list",
    name: "Task list",
    group: "Inputs",
    description:
      "Make a little progress. Finished tasks move gently out of the way.",
    component: "TaskList",
  },
  {
    id: "emoji-reaction",
    name: "Emoji reaction",
    group: "Feedback",
    description:
      "Sometimes a small reaction says enough. Pick one and send it on its way.",
    component: "EmojiReaction",
  },
  {
    id: "notification-bell",
    name: "Notification bell",
    group: "Feedback",
    description: "A little nudge, a tiny badge. Something new is waiting.",
    component: "NotificationBell",
  },
] as const;
export type InteractionComponentId = (typeof interactionCatalog)[number]["id"];
export const interactionExamples: Record<InteractionComponentId, string> = {
  folder: '<Folder color="#4388ed" label="Project files" />',
  "code-block":
    '<CodeBlock code={"const answer = 42;"} language="typescript" filename="answer.ts" highlightLines={[1]} />',
  "gravity-letters": '<GravityLetters type="both" maxGlyphs={80} />',
  "github-activity":
    '<GithubActivity\n  contributions={[{ date: "2026-10-16", count: 5 }]}\n  repos={[{ name: "my-project", count: 5 }]}\n/>',
  "step-player": "<StepPlayer steps={5} duration={2000} />",
  "animated-counter": '<AnimatedCounter value={12849} separator="," />',
  "voice-note": '<VoiceNote src="/audio/note.mp3" />',
  faq: '<Faq items={[{ id: "intro", question: "How does it work?", answer: "Click a question to open its answer." }]} />',
  "fluid-orb": '<FluidOrb size={240} color="#4388ed" />',
  "grid-reveal": '<GridReveal src="/image.jpg" alt="Describe your image" />',
  "matrix-orb": '<MatrixOrb size={240} state="listening" />',
  "web-search":
    '<WebSearch sources={[{ id: "docs", title: "React documentation", url: "https://react.dev", snippet: "Learn about React." }]} />',
  "ai-status": '<AiStatus state="researching" detail="3 sources" timer />',
  "bounce-sidebar":
    '<BounceSidebar items={[{ id: "home", label: "Home" }, { id: "work", label: "Work" }]} />',
  "hook-sidebar":
    '<HookSidebar items={[{ id: "home", label: "Home" }, { id: "work", label: "Work" }]} />',
  "proximity-sidebar":
    '<ProximitySidebar items={[{ id: "home", label: "Home" }, { id: "work", label: "Work" }]} />',
  "scroll-progress":
    '<ScrollProgress sections={[{ id: "intro", label: "Introduction" }, { id: "details", label: "Details" }]} />\n// Add matching IDs to headings in your page.\n// Pass containerRef to track a nested scroll container.',
  "rail-toc":
    '<RailToc sections={[{ id: "intro", label: "Introduction" }, { id: "details", label: "Details", depth: 1 }]} />\n// Add matching IDs to headings in your page.\n// Pass containerRef to track a nested scroll container.',
  "gooey-nav":
    '<GooeyNav items={[{ id: "home", label: "Home" }, { id: "work", label: "Work" }]} />',
  "duration-picker":
    "<DurationPicker defaultValue={{ hours: 1, minutes: 30 }} />",
  "otp-input": '<OtpInput length={6} type="numbers" />',
  "delete-button":
    "<DeleteButton onConfirm={async () => {\n  // Remove the selected item in your application.\n}} />",
  "task-list":
    '<TaskList defaultItems={[{ id: "first", label: "Make something useful", completed: false }]} />',
  "emoji-reaction": "<EmojiReaction />",
  "notification-bell": "<NotificationBell count={3} />",
};
