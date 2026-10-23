export const selectionSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
};
export const pointerMotion = { magnetX: 5, magnetY: 4, pull: 0.12, tilt: 3.5 };

export const dockSpring = { stiffness: 360, damping: 24, mass: 0.7 };
export const deckSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 28,
};
export const explorationMotion = {
  dockReach: 110,
  dockScale: 1.6,
  dockLift: 12,
  deckTilt: 12,
  deckExit: 0.16,
  deckThreshold: 75,
  deckVelocity: 650,
  scrambleFrame: 32,
  scrambleDuration: 700,
};
export const previewSpring = { stiffness: 320, damping: 30, mass: 0.6 };
export const elasticSpring = { stiffness: 280, damping: 18, mass: 0.65 };
export const gestureMotion = { previewGap: 16, sliderBend: 18 };
export const workspaceMotion = {
  maxZoom: 4,
  swipeDistance: 50,
  headerThreshold: 12,
};

export const playgroundMotion = {
  trailDistance: 38,
  trailLimit: 8,
  trailLifetime: 850,
  holdMinimum: 600,
  holdMaximum: 4000,
  scrubPixels: 8,
};

export const mobileMotion = {
  axisSlop: 8,
  swipeRatio: 0.35,
  pullThreshold: 60,
  pullLimit: 100,
  pullResistance: 0.5,
  longPressSlop: 10,
};

export const filterMotion = {
  layout: { type: "spring" as const, stiffness: 620, damping: 38 },
  opacity: { duration: 0.12 },
  y: { duration: 0.14 },
  scale: { duration: 0.12 },
};

export const experimentalMotion = {
  pixelRatio: 1.5,
  particleLimit: 1800,
  particleReach: 100,
  boardWidth: 1200,
  boardHeight: 800,
  nodeWidth: 200,
  nodeHeight: 190,
  nodeLimit: 12,
  minZoom: 0.2,
  maxZoom: 1.8,
  pulseLimit: 32,
  noteLength: 0.42,
  stepLength: 360,
  voiceLimit: 6,
};
