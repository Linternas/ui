import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DesignSystemProvider, type Theme } from "../../src/system/base";
import { IconButton, LinkButton } from "../../src/system/display";
import {
  CopyButton,
  SegmentedControl,
} from "../../src/system/micro-interactions";
import { ImageParticleMorph } from "../../src/collections/lab";
import { TextReveal } from "../../src/TextReveal";
import {
  playgroundExperiments,
  uiCatalog,
} from "@mingu/interaction-ui/catalog";
import Link from "./routing";
import { Arrow, Mark, Sun, Moon } from "./LandingIcons";
const NewestPreview = lazy(() => import("./NewestPreview"));
const SystemBench = lazy(() => import("./LandingWorkbench"));
import "./landing.css";

const components = uiCatalog.filter(
  (entry) => entry.kind === "core" || entry.kind === "interaction",
);
const picks = [
  "cloth-playground",
  "elastic-mesh",
  "focus-dock",
  "orbit-composer",
  "animated-filter-bar",
  "prompt-composer",
];
const featured = picks.map((id) => uiCatalog.find((entry) => entry.id === id)!);
const install = "npm install git+https://github.com/Linternas/ui.git";
function Deferred({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (records) => {
        if (records.some((record) => record.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "280px" },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={root}
      className={`landing-deferred ${className}`}
      data-ready={ready}
    >
      {ready ? (
        <Suspense
          fallback={
            <div className="landing-loading" aria-label="인터랙션 준비 중" />
          }
        >
          {children}
        </Suspense>
      ) : (
        <div className="landing-loading" aria-label="인터랙션 준비 중" />
      )}
    </div>
  );
}
export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>("system"),
    [shape, setShape] = useState("volume");
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("mingu-ui-theme");
      setTheme(
        saved === "light" || saved === "dark"
          ? saved
          : matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
      );
    } catch {}
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      sessionStorage.setItem("mingu-ui-theme", next);
    } catch {}
  };
  return (
    <DesignSystemProvider
      theme={theme}
      accent="neutral"
      className="landing-page"
    >
      <a className="landing-skip" href="#landing-main">
        본문으로 건너뛰기
      </a>
      <header className="landing-header">
        <Link href="/" className="landing-wordmark" aria-label="Mingu UI 홈">
          <Mark />
          <span>
            Mingu UI<span className="landing-wordmark-dot">.</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/all">
            Components <span>{components.length}</span>
          </Link>
          <Link href="/playground">
            Playground <Arrow diagonal />
          </Link>
          <Link className="landing-foundations-link" href="/foundations">
            The system
          </Link>
        </nav>
        <div className="landing-header-actions">
          <a
            href="https://github.com/Linternas/ui"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <Arrow diagonal />
          </a>
          <IconButton
            label={theme === "dark" ? "라이트 테마로 전환" : "다크 테마로 전환"}
            variant="ghost"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </IconButton>
        </div>
      </header>
      <main id="landing-main" tabIndex={-1}>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">
              <span className="landing-live-dot" /> A DESIGN SYSTEM BY MINGU
            </p>
            <h1 id="landing-title">
              Built to
              <br />
              <span>feel right.</span>
            </h1>
            <p className="landing-hero-description">
              좋은 인터페이스는 설명보다 먼저 느껴집니다.
              <br />
              작은 버튼의 반응부터, 손끝을 따라 움직이는 세계까지.
            </p>
            <div className="landing-hero-actions">
              <LinkButton href="/all" size="lg">
                컴포넌트 둘러보기 <Arrow />
              </LinkButton>
              <a className="landing-text-link" href="#craft">
                먼저 만져보기 <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="landing-hero-signature">
              <span>DESIGNED. CODED. TUNED.</span>
              <span>React / TypeScript / A little obsession</span>
            </div>
          </div>
          <figure className="landing-hero-object">
            <div className="landing-sculpture-label">
              <span>001 / FROM PIXELS TO PRESENCE</span>
              <span className="landing-live-tag">
                <i /> LIVE
              </span>
            </div>
            <div className="landing-sculpture">
              <ImageParticleMorph
                src="/ui-lab/signal.svg"
                alt="푸른 그라데이션 픽셀이 입체 구로 변하는 인터랙티브 조형물"
                label="Mingu particle sculpture"
                amount={shape === "volume" ? 1 : 0}
                onAmountChange={(value) =>
                  setShape(value > 0.5 ? "volume" : "image")
                }
                autoRotate
              />
            </div>
            <figcaption>
              <SegmentedControl
                label="조형물 형태"
                value={shape}
                onValueChange={setShape}
                options={[
                  { value: "image", label: "Pixels" },
                  { value: "volume", label: "Volume" },
                ]}
              />
              <span>
                DRAG TO ROTATE <Arrow diagonal />
              </span>
            </figcaption>
          </figure>
        </section>
        <div className="landing-facts" aria-label="Design system inventory">
          {[
            { count: components.length, label: "COMPONENTS" },
            {
              count: components.filter((entry) => entry.kind === "core").length,
              label: "CORE PRIMITIVES",
            },
            {
              count: components.filter((entry) => entry.kind === "interaction")
                .length,
              label: "INTERACTIONS",
            },
            { count: playgroundExperiments.length, label: "LIVE EXPERIMENTS" },
          ].map((item) => (
            <div key={item.label}>
              <strong>
                {item.count}
                <span> /</span>
              </strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <section
          id="craft"
          className="landing-craft"
          aria-labelledby="landing-craft-title"
        >
          <div className="landing-section-heading">
            <div>
              <p className="landing-eyebrow">01 / A LITTLE HANDS-ON</p>
              <h2 id="landing-craft-title">
                Less watching.
                <br />
                More playing.
              </h2>
            </div>
            <div>
              <p>
                당겨보고, 눌러보고, 바꿔보세요.
                <br />
                여기 보이는 모든 것은 실제 컴포넌트입니다.
              </p>
              <Link href="/all" className="landing-text-link">
                전체 {components.length}개 보기 <Arrow />
              </Link>
            </div>
          </div>
          <Deferred className="landing-featured-deferred">
            <NewestPreview
              entries={featured}
              label="Featured"
              filterable={false}
            />
          </Deferred>
        </section>
        <section className="landing-statement">
          <span className="landing-eyebrow">THE DETAILS ARE THE DESIGN.</span>
          <TextReveal text="좋은 움직임은 장식에 머물지 않습니다. 어디를 눌렀는지, 무엇이 바뀌었는지, 다음에 무엇을 할 수 있는지. 작은 반응이 인터페이스 전체를 만듭니다." />
        </section>
        <section
          id="system"
          className="landing-system"
          aria-labelledby="landing-system-title"
        >
          <div className="landing-section-heading">
            <div>
              <p className="landing-eyebrow">02 / BUILT TO BELONG TOGETHER</p>
              <h2 id="landing-system-title">
                One system.
                <br />
                Your signature.
              </h2>
            </div>
            <p>
              입력부터 물리 인터랙션까지, 하나의 시각 언어.
              <br />
              토큰을 바꾸면 표정이 바뀌고, 기본 동작은 이어집니다.
            </p>
          </div>
          <Deferred>
            <SystemBench />
          </Deferred>
        </section>
        <section
          className="landing-start"
          aria-labelledby="landing-start-title"
        >
          <p className="landing-eyebrow">03 / MAKE SOMETHING FEEL GOOD</p>
          <h2 id="landing-start-title">
            Your next idea.
            <br />
            <span>Start here.</span>
          </h2>
          <div className="landing-start-actions">
            <LinkButton href="/all" size="lg">
              Explore the components <Arrow />
            </LinkButton>
            <LinkButton href="/foundations" variant="outline" size="lg">
              시스템 살펴보기 <Arrow diagonal />
            </LinkButton>
          </div>
          <div className="landing-install">
            <code>{install}</code>
            <CopyButton
              text={install}
              label="설치 명령 복사"
              copiedLabel="복사했어요"
              variant="ghost"
            />
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <Link href="/" className="landing-wordmark">
          <Mark />
          Mingu UI.
        </Link>
        <p>
          A personal pursuit of a better interface.
          <br />
          Designed & engineered by Mingu.
        </p>
        <div>
          <a
            href="https://github.com/Linternas/ui"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source code <Arrow diagonal />
          </a>
          <Link href="/newest">
            Newest <Arrow diagonal />
          </Link>
          <Link href="/all">
            All components <Arrow diagonal />
          </Link>
        </div>
        <span>Built with Mingu UI.</span>
      </footer>
    </DesignSystemProvider>
  );
}
