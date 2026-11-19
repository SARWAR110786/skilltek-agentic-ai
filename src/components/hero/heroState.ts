/** Mutable state shared between the GSAP-driven hero overlay and the R3F scene
 *  (read every frame inside useFrame, so it is intentionally not React state). */
export const heroState = {
  /** 0 → 1 across the pinned hero scroll distance */
  progress: 0,
  /** pointer position, -1 … 1 */
  mx: 0,
  my: 0,
  /** desktop layout: scene offset to the right of the copy */
  wide: true,
  reduced: false,
};
