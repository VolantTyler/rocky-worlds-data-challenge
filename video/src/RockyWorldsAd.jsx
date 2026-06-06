import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const scenes = [
  { start: 0, end: 150 },
  { start: 150, end: 330 },
  { start: 330, end: 540 },
  { start: 540, end: 720 },
  { start: 720, end: 900 },
];

function seconds(frame, fps) {
  return frame / fps;
}

function useSceneProgress(start, end) {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing: ease,
  });
}

function FadeScene({ start, end, children }) {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [start, start + 18], [0, 1], clamp),
    interpolate(frame, [end - 18, end], [1, 0], clamp),
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
}

function Starfield() {
  const frame = useCurrentFrame();
  const stars = Array.from({ length: 88 }, (_, index) => {
    const x = (index * 131 + 43) % 1920;
    const y = (index * 89 + 71) % 1080;
    const size = 1 + ((index * 17) % 4);
    const alpha =
      0.28 + 0.42 * Math.sin(frame / 38 + index * 1.7) * Math.sin(index + 2);
    return (
      <span
        key={index}
        className="star"
        style={{
          left: x,
          top: y,
          width: size,
          height: size,
          opacity: Math.max(0.14, alpha),
        }}
      />
    );
  });
  return <div className="starfield">{stars}</div>;
}

function OrbitalSystem() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = seconds(frame, fps);
  const orbit = t * 0.55;
  const planetX = 520 + Math.cos(orbit) * 260;
  const planetY = 518 + Math.sin(orbit) * 96;
  const eclipse = interpolate(frame, [62, 100, 128], [0, 1, 0], clamp);

  return (
    <div className="orbital-stage">
      <div className="host-star" />
      <div className="orbit-line" />
      <div
        className="moving-planet"
        style={{ transform: `translate(${planetX}px, ${planetY}px)` }}
      />
      <div className="eclipse-signal" style={{ opacity: eclipse }}>
        73.8 ppm
      </div>
    </div>
  );
}

function LightCurve({ compact = false }) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [190, 290], [0, 1], clamp);
  const points = Array.from({ length: 74 }, (_, index) => {
    const x = 20 + index * 12;
    const wave = Math.sin(index * 0.53) * 10 + Math.cos(index * 0.17) * 7;
    const eclipse = index > 34 && index < 47 ? 54 : 0;
    const y = 98 + wave + eclipse;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className={compact ? "chart-card compact-chart" : "chart-card"}>
      <div className="chart-header">
        <span>JWST/MIRI F1500W</span>
        <strong>secondary eclipse</strong>
      </div>
      <svg viewBox="0 0 940 260" className="light-curve">
        <defs>
          <linearGradient id="curve" x1="0" x2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="52%" stopColor="#f8d66d" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="20"
            x2="900"
            y1={46 + line * 48}
            y2={46 + line * 48}
            className="grid-line"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="url(#curve)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1320,
            strokeDashoffset: 1320 * (1 - progress),
          }}
        />
        <rect
          x="430"
          y="62"
          width="138"
          height="116"
          rx="20"
          className="eclipse-window"
          style={{ opacity: interpolate(frame, [250, 295], [0, 1], clamp) }}
        />
      </svg>
    </div>
  );
}

function PosteriorCard() {
  const frame = useCurrentFrame();
  const bars = [55, 74, 94, 22, 37, 78];
  return (
    <div className="posterior-card">
      <div className="posterior-title">
        <span>Posterior distribution</span>
        <strong>depth_ecl</strong>
      </div>
      <div className="posterior-bars">
        {bars.map((height, index) => {
          const scale = interpolate(
            frame,
            [360 + index * 7, 410 + index * 7],
            [0.12, 1],
            { ...clamp, easing: ease },
          );
          return (
            <div
              key={index}
              className="posterior-bar"
              style={{ height, transform: `scaleY(${scale})` }}
            />
          );
        })}
      </div>
      <div className="posterior-stats">
        <span>P16 55.1</span>
        <span>P50 73.8</span>
        <span>P84 94.4</span>
      </div>
    </div>
  );
}

function Pipeline() {
  const frame = useCurrentFrame();
  const steps = ["Ingest", "Validate", "Model", "Infer", "Submit"];
  return (
    <div className="pipeline">
      {steps.map((step, index) => {
        const active = interpolate(
          frame,
          [552 + index * 28, 586 + index * 28],
          [0, 1],
          clamp,
        );
        return (
          <React.Fragment key={step}>
            <div
              className="pipeline-node"
              style={{
                borderColor: active > 0.6 ? "#22d3ee" : "rgba(255,255,255,0.16)",
                color: active > 0.6 ? "#e0faff" : "#94a3b8",
                transform: `translateY(${(1 - active) * 18}px)`,
                opacity: 0.42 + active * 0.58,
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {step}
            </div>
            {index < steps.length - 1 ? <div className="pipeline-link" /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DashboardPreview() {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [615, 690], [54, 0], {
    ...clamp,
    easing: ease,
  });

  return (
    <div className="dashboard-preview" style={{ transform: `translateY(${slide}px)` }}>
      <div className="browser-bar">
        <span />
        <span />
        <span />
        <strong>Rocky Worlds Dashboard</strong>
      </div>
      <div className="dashboard-grid">
        <div className="metric large">
          <small>Target</small>
          <strong>GJ 3929 b</strong>
          <p>Hot terrestrial super-Earth</p>
        </div>
        <div className="metric">
          <small>Median depth</small>
          <strong>73.8 ppm</strong>
        </div>
        <div className="metric">
          <small>Samples</small>
          <strong>12,000</strong>
        </div>
        <LightCurve compact />
      </div>
    </div>
  );
}

function CopyBlock({ eyebrow, title, body, align = "left" }) {
  return (
    <div className={`copy-block ${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {body ? <p className="body-copy">{body}</p> : null}
    </div>
  );
}

function SceneOne() {
  const p = useSceneProgress(0, 150);
  return (
    <FadeScene start={0} end={150}>
      <div className="split-scene">
        <div style={{ opacity: p, transform: `translateY(${(1 - p) * 34}px)` }}>
          <CopyBlock
            eyebrow="Rocky Worlds Data Challenge"
            title="Turn faint eclipse signals into decisions."
            body="A reproducible analysis workspace for JWST rocky-planet photometry."
          />
        </div>
        <OrbitalSystem />
      </div>
    </FadeScene>
  );
}

function SceneTwo() {
  const p = useSceneProgress(150, 330);
  return (
    <FadeScene start={150} end={330}>
      <div className="scene-center">
        <CopyBlock
          eyebrow="From raw photons"
          title="See the signal hiding inside noisy time-series data."
          body="Inventory, validation, cadence checks, and quick visual diagnostics in one shared repo."
          align="center"
        />
        <div
          className="chart-wrap"
          style={{ opacity: p, transform: `scale(${0.94 + p * 0.06})` }}
        >
          <LightCurve />
        </div>
      </div>
    </FadeScene>
  );
}

function SceneThree() {
  const p = useSceneProgress(330, 540);
  return (
    <FadeScene start={330} end={540}>
      <div className="analysis-scene">
        <div style={{ transform: `translateX(${(1 - p) * -48}px)`, opacity: p }}>
          <CopyBlock
            eyebrow="Model with confidence"
            title="Baseline fits. Residual checks. Posterior uncertainty."
            body="Move from exploratory light curves to submission-ready `depth_ecl` distributions."
          />
        </div>
        <PosteriorCard />
      </div>
    </FadeScene>
  );
}

function SceneFour() {
  return (
    <FadeScene start={540} end={720}>
      <div className="workflow-scene">
        <CopyBlock
          eyebrow="Built for repeatable science"
          title="One pipeline. One dashboard. One clean handoff."
          body="Local Kaggle ingestion, Python modeling, and React presentation live together."
          align="center"
        />
        <Pipeline />
        <DashboardPreview />
      </div>
    </FadeScene>
  );
}

function SceneFive() {
  const p = useSceneProgress(720, 900);
  return (
    <FadeScene start={720} end={900}>
      <div className="final-scene">
        <div className="final-planet" />
        <div style={{ opacity: p, transform: `translateY(${(1 - p) * 38}px)` }}>
          <p className="eyebrow">Rocky Worlds Data Challenge</p>
          <h1>Analyze deeper. Submit smarter.</h1>
          <p className="body-copy">
            Reproducible exoplanet workflows for the next rocky-world discovery.
          </p>
          <div className="cta-row">
            <span>Ingest</span>
            <span>Validate</span>
            <span>Model</span>
            <span>Visualize</span>
          </div>
        </div>
      </div>
    </FadeScene>
  );
}

export function RockyWorldsAd() {
  return (
    <AbsoluteFill className="video-root">
      <Starfield />
      <div className="ambient one" />
      <div className="ambient two" />
      <Sequence from={scenes[0].start} durationInFrames={scenes[0].end}>
        <SceneOne />
      </Sequence>
      <SceneTwo />
      <SceneThree />
      <SceneFour />
      <SceneFive />
      <div className="brand-lockup">Rocky Worlds</div>
    </AbsoluteFill>
  );
}
