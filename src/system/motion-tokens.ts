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
  deckThreshold: 75,
  deckVelocity: 650,
  scrambleFrame: 32,
  scrambleDuration: 700,
};
