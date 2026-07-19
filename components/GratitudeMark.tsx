// The "G" glyph extracted from logos/gratitude-white.svg (the real wordmark),
// used as the app monogram. Renders in currentColor so it inherits text color.
export default function GratitudeMark({
  size = 16,
  className = "",
}: {
  /** Rendered height in px. Width scales to the glyph's aspect ratio. */
  size?: number;
  className?: string;
}) {
  const width = Math.round(size * (145.01 / 287.89) * 100) / 100;
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 145.01 287.89"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d="M145.01,148.54v59.77c0,56.59-19.81,79.58-70.03,79.58S0,264.55,0,207.61v-122.73C0,27.94,21.22,0,72.15,0s70.38,26.17,70.38,74.27l-1.41,39.61h-46.69v-32.54c0-27.23-2.12-38.9-22.28-38.9-18.74,0-21.93,11.67-21.93,40.67v124.49c0,29,5.66,38.9,25.11,38.9s25.11-8.84,25.11-38.2v-20.51h-24.76v-39.26h69.32Z" />
    </svg>
  );
}
