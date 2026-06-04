/**
 * "work = play" sketch (Figma 46:160) rebuilt as a single inline SVG so it
 * stays vector and scales to the column width. Each hand-drawn piece is an
 * external SVG referenced via <image>; positions/sizes match the source frame
 * (576×340), including the ~2px stroke bleed each asset carries.
 *
 * The comment cursor and the "work = play" bubble live in one group so they
 * drift together (.wip-float), and the bubble cycles through the rainbow
 * (.wip-hue) — see globals.css.
 */
export function WorkIsPlay() {
  const p = "/illustrations/work-is-play";
  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-black/[0.12] bg-[#fafafa]">
      <svg
        viewBox="0 0 576 340"
        className="block w-full"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Hand-drawn sketch of a sun, house and plants with a “work = play” comment"
      >
        <defs>
          <filter id="wip-shadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow
              dx="4"
              dy="4"
              stdDeviation="2.5"
              floodColor="#2e90fa"
              floodOpacity="0.16"
            />
          </filter>
        </defs>

        {/* Sun + rays — top-left */}
        <image href={`${p}/sun.svg`} x="-6.00" y="-3.00" width="123.00" height="135.01" preserveAspectRatio="none" />
        <image href={`${p}/ray1.svg`} x="42.07" y="138.89" width="13.95" height="28.77" preserveAspectRatio="none" />
        <image href={`${p}/ray2.svg`} x="89.84" y="116.10" width="14.48" height="17.27" preserveAspectRatio="none" />
        <image href={`${p}/ray3.svg`} x="122.69" y="83.83" width="26.87" height="11.90" preserveAspectRatio="none" />
        <image href={`${p}/ray4.svg`} x="135.93" y="42.48" width="21.02" height="4.47" preserveAspectRatio="none" />

        {/* Clouds — top */}
        <image href={`${p}/cloud-mid.svg`} x="223.00" y="19.00" width="83.85" height="62.19" preserveAspectRatio="none" />
        <image href={`${p}/cloud-tr.svg`} x="384.99" y="-23.00" width="193.42" height="101.60" preserveAspectRatio="none" />

        {/* House — right */}
        <image href={`${p}/house.svg`} x="278.99" y="78.51" width="205.02" height="264.91" preserveAspectRatio="none" />

        {/* Plants — bottom-left */}
        <image href={`${p}/plant-mid.svg`} x="152.00" y="266.01" width="49.31" height="75.83" preserveAspectRatio="none" />
        <image href={`${p}/plant-left.svg`} x="80.00" y="272.00" width="41.00" height="71.01" preserveAspectRatio="none" />

        {/* Comment cursor + "work = play" bubble — one unit that drifts together */}
        <g className="wip-float">
          <image href={`${p}/cursor.svg`} x="107.00" y="151.00" width="23.30" height="24.26" preserveAspectRatio="none" />
          {/* hue-rotate wraps the shadow too, so it always tracks the bubble. */}
          <g className="wip-hue">
            <g filter="url(#wip-shadow)">
              <path
                d="M129 173 L222 173 A18 18 0 0 1 240 191 A18 18 0 0 1 222 209 L145 209 A18 18 0 0 1 127 191 L127 175 A2 2 0 0 1 129 173 Z"
                fill="#2e90fa"
              />
              <text
                x="141"
                y="191"
                dominantBaseline="central"
                fill="#ffffff"
                fontSize="14"
                fontWeight={510}
                className="font-sans"
              >
                work = play?
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
