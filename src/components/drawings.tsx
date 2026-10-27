/**
 * Original architectural line drawings used in place of photography until
 * approved project photographs are available. They are illustrations, not
 * records of RenewBrick work, and are captioned as such wherever they appear.
 * Lines use `currentColor`; set the colour with a text-* class on the parent.
 */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Hero: elevation of a six-storey apartment block with one unit "renewed". */
export function ElevationDrawing({ className = "" }: { className?: string }) {
  const floors = 6;
  const floorH = 76;
  const top = 128;
  const ground = top + floors * floorH; // 584
  const cols = [138, 228, 332, 422];
  const renewed = new Set(["2-1", "2-2"]); // floor index from bottom, column index

  return (
    <svg
      viewBox="0 0 560 660"
      role="img"
      aria-label="Illustration: line drawing of an apartment building elevation, with one apartment highlighted"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {/* drawing border + title strip */}
      <rect x="8.5" y="8.5" width="543" height="643" strokeOpacity="0.35" />
      <path d="M8.5 612.5h543M380.5 612.5v39" strokeOpacity="0.35" />

      {/* level dimension line */}
      <path d={`M48.5 ${top}V${ground}`} strokeOpacity="0.5" />
      {range(floors + 1).map((i) => {
        const y = ground - i * floorH + 0.5;
        return (
          <g key={i} strokeOpacity="0.5">
            <path d={`M42 ${y}h13`} />
            <path d={`M45 ${y + 4}l7 -8`} />
          </g>
        );
      })}

      {/* building outline, parapet, plinth */}
      <path d={`M88.5 ${ground}V${top}h384V${ground}`} strokeWidth="1.5" />
      <path d={`M80.5 ${top}h400v-14h-400z`} strokeOpacity="0.8" />
      <path d={`M280.5 ${top - 14}v-34h64v34`} strokeOpacity="0.6" />
      <path d={`M296.5 ${top - 48}v-8h32v8`} strokeOpacity="0.4" />

      {/* floor slabs */}
      {range(floors - 1).map((i) => {
        const y = ground - (i + 1) * floorH + 0.5;
        return <path key={i} d={`M88.5 ${y}h384`} strokeOpacity="0.35" />;
      })}

      {/* stair core */}
      <path d={`M272.5 ${top}V${ground}M288.5 ${top}V${ground}`} strokeOpacity="0.3" />

      {/* windows and balconies */}
      {range(floors).map((f) =>
        cols.map((cx, c) => {
          const yTop = ground - (f + 1) * floorH + 16;
          const isRenewed = renewed.has(`${f}-${c}`);
          const isGround = f === 0;
          if (isGround && (c === 1 || c === 2)) return null;
          return (
            <g key={`${f}-${c}`}>
              <rect
                x={cx - 30 + 0.5}
                y={yTop + 0.5}
                width="60"
                height="44"
                className={isRenewed ? "text-gold" : undefined}
                stroke="currentColor"
                strokeOpacity={isRenewed ? 1 : 0.7}
                fill={isRenewed ? "currentColor" : "none"}
                fillOpacity={isRenewed ? 0.16 : 0}
                strokeWidth={isRenewed ? 1.5 : 1}
              />
              <path
                d={`M${cx + 0.5} ${yTop + 1}v43M${cx - 30} ${yTop + 22.5}h60`}
                className={isRenewed ? "text-gold" : undefined}
                stroke="currentColor"
                strokeOpacity={isRenewed ? 0.9 : 0.35}
              />
              {!isGround && (c === 0 || c === 3) && (
                <path
                  d={`M${cx - 38} ${yTop + 52.5}h76M${cx - 38} ${yTop + 38}v15M${cx + 38} ${yTop + 38}v15`}
                  strokeOpacity="0.55"
                />
              )}
            </g>
          );
        }),
      )}

      {/* entrance */}
      <path d={`M246.5 ${ground}v-58h68v58M280.5 ${ground - 58}v58`} strokeOpacity="0.7" />
      <path d={`M232.5 ${ground - 64}h96`} strokeOpacity="0.7" />

      {/* ground line and hatch */}
      <path d={`M20 ${ground + 0.5}h520`} strokeWidth="1.5" />
      {range(26).map((i) => (
        <path key={i} d={`M${24 + i * 20} ${ground + 16}l12 -14`} strokeOpacity="0.3" />
      ))}

      {/* callout for the renewed unit */}
      <g className="text-gold" stroke="currentColor">
        <path d={`M198 ${ground - 3 * floorH + 10}h164`} strokeOpacity="0.8" />
        <circle cx="280" cy={ground - 3 * floorH + 10} r="3" fill="currentColor" />
        <path d={`M280 ${ground - 3 * floorH + 10}L512 ${ground - 3 * floorH - 40}`} strokeOpacity="0.8" />
        <circle cx="512" cy={ground - 3 * floorH - 40} r="14" />
      </g>
      <text
        x="512"
        y={ground - 3 * floorH - 35.5}
        textAnchor="middle"
        className="fill-gold font-sans"
        stroke="none"
        fontSize="12"
        fontWeight="600"
      >
        3B
      </text>

      {/* title strip text */}
      <text x="24" y="637" className="fill-current font-sans" stroke="none" fontSize="10.5" letterSpacing="1.6" opacity="0.7">
        ELEVATION — ILLUSTRATIVE
      </text>
      <text x="396" y="637" className="fill-current font-sans" stroke="none" fontSize="10.5" letterSpacing="1.6" opacity="0.7">
        SHEET 00
      </text>
    </svg>
  );
}

/** Renovation: section through a bathroom wall and floor, waterproofing layer in gold. */
export function SectionDrawing({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Illustration: cross-section of a bathroom floor and wall showing tiles, screed and a waterproofing layer"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {/* slab */}
      <path d="M20 300.5h440M20 330.5h440" strokeWidth="1.5" />
      {range(22).map((i) => (
        <path key={i} d={`M${28 + i * 20} 330l14 -28`} strokeOpacity="0.3" />
      ))}
      {/* wall */}
      <path d="M60.5 40v260M100.5 40v220" strokeWidth="1.5" />
      {range(11).map((i) => (
        <path key={i} d={`M61 ${60 + i * 22}l38 -18`} strokeOpacity="0.25" />
      ))}
      {/* waterproofing: up the wall and across the floor */}
      <path className="text-gold" stroke="currentColor" strokeWidth="3" d="M104 120V284h356" />
      {/* screed */}
      <path d="M104 268.5h356" strokeOpacity="0.5" />
      {/* floor tiles */}
      <path d="M104 262.5h356" strokeWidth="1.5" />
      {range(7).map((i) => (
        <path key={i} d={`M${164.5 + i * 50} 262v6`} strokeOpacity="0.6" />
      ))}
      {/* wall tiles */}
      <path d="M108.5 60v202" strokeWidth="1.5" />
      {range(6).map((i) => (
        <path key={i} d={`M104 ${92.5 + i * 34}h4.5`} strokeOpacity="0.6" />
      ))}
      {/* floor slope + drain */}
      <path d="M380 262l40 4h20" strokeOpacity="0.6" strokeDasharray="3 3" />
      <rect x="418.5" y="262.5" width="22" height="6" strokeOpacity="0.8" />
      {/* leaders */}
      <g strokeOpacity="0.8">
        <path d="M108 160h120" />
        <path d="M240 262v-66" />
        <path className="text-gold" stroke="currentColor" d="M200 284v36h60" />
        <path d="M410 268v-90h20" />
      </g>
      <g className="fill-current font-sans" stroke="none" fontSize="12" letterSpacing="1.2">
        <text x="234" y="164">WALL TILE</text>
        <text x="232" y="192" textAnchor="end">FLOOR TILE</text>
        <text x="266" y="324" className="fill-gold">WATERPROOFING</text>
        <text x="436" y="182" textAnchor="start">FALL</text>
      </g>
    </svg>
  );
}

/** Maintenance: floor plan with numbered inspection points. */
export function InspectionPlanDrawing({ className = "" }: { className?: string }) {
  const points: [number, number][] = [
    [96, 92], [300, 84], [404, 196], [176, 236], [300, 292], [92, 300],
  ];
  return (
    <svg
      viewBox="0 0 480 380"
      role="img"
      aria-label="Illustration: apartment floor plan marked with numbered inspection points"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M40.5 40.5h400v300h-400z" strokeWidth="3" />
      <path d="M40.5 160.5h140M180.5 40.5v80M180.5 150.5v40M180.5 220.5v120M260.5 40.5v120M260.5 160.5h180M320.5 160.5v60M320.5 250.5v90" strokeWidth="1.5" />
      {/* door swings */}
      <path d="M180.5 120.5a30 30 0 0 1 30 30" strokeOpacity="0.5" />
      <path d="M180.5 190.5a30 30 0 0 0 30 30" strokeOpacity="0.5" />
      <path d="M320.5 220.5a30 30 0 0 1 30 30" strokeOpacity="0.5" />
      {/* fixtures */}
      <rect x="380.5" y="60.5" width="44" height="80" strokeOpacity="0.5" />
      <circle cx="402" cy="80" r="10" strokeOpacity="0.5" />
      <rect x="54.5" y="54.5" width="70" height="30" strokeOpacity="0.5" />
      <path d="M200 300.5h100" strokeOpacity="0.5" />
      {/* windows */}
      <path d="M90 37v7M150 37v7M300 337v7M380 337v7M437 220v60" strokeOpacity="0.8" strokeWidth="2" />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="13" className="text-gold" stroke="currentColor" fill="currentColor" fillOpacity="0.14" strokeWidth="1.5" />
          <text x={x} y={y + 4} textAnchor="middle" stroke="none" className="fill-current font-sans" fontSize="11.5" fontWeight="600">
            {String(i + 1).padStart(2, "0")}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Rental-ready: plan with snag marks (×) and cleared marks (✓-style ticks). */
export function SnagPlanDrawing({ className = "" }: { className?: string }) {
  const snags: [number, number, boolean][] = [
    [110, 110, true], [220, 80, false], [360, 120, true], [140, 250, true], [300, 270, false], [390, 280, true],
  ];
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Illustration: floor plan with snag items marked, some resolved and some outstanding"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M40.5 40.5h400v280h-400z" strokeWidth="3" />
      <path d="M40.5 180.5h120M220.5 40.5v100M220.5 180.5v140M220.5 180.5h80M340.5 180.5h100M300.5 40.5v100" strokeWidth="1.5" />
      <path d="M160.5 180.5a30 30 0 0 1 -30 -30" strokeOpacity="0.5" />
      <path d="M300.5 180.5a30 30 0 0 0 40 0" strokeOpacity="0.5" />
      {snags.map(([x, y, cleared], i) =>
        cleared ? (
          <g key={i} className="text-gold" stroke="currentColor" strokeWidth="2">
            <circle cx={x} cy={y} r="14" strokeWidth="1.5" />
            <path d={`M${x - 6} ${y}l4 5 8 -10`} />
          </g>
        ) : (
          <g key={i} strokeWidth="2">
            <circle cx={x} cy={y} r="14" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d={`M${x - 5} ${y - 5}l10 10M${x + 5} ${y - 5}l-10 10`} />
          </g>
        ),
      )}
    </svg>
  );
}

/** Management: an elevation grid of units across two buildings. */
export function PortfolioDrawing({ className = "" }: { className?: string }) {
  const watched = new Set(["0-1-2", "0-3-0", "1-1-1", "1-2-2"]);
  return (
    <svg
      viewBox="0 0 480 320"
      role="img"
      aria-label="Illustration: two buildings drawn as grids of units, several units highlighted"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {[0, 1].map((b) => {
        const x0 = 40 + b * 220;
        const floors = b === 0 ? 4 : 3;
        const yTop = 280 - floors * 56;
        return (
          <g key={b}>
            <path d={`M${x0 + 0.5} 280V${yTop + 0.5}h180V280`} strokeWidth="1.5" />
            {range(floors).map((f) =>
              range(3).map((c) => {
                const on = watched.has(`${b}-${f}-${c}`);
                return (
                  <rect
                    key={`${f}-${c}`}
                    x={x0 + 14 + c * 56 + 0.5}
                    y={280 - (f + 1) * 56 + 12 + 0.5}
                    width="40"
                    height="32"
                    className={on ? "text-gold" : undefined}
                    stroke="currentColor"
                    strokeOpacity={on ? 1 : 0.55}
                    fill={on ? "currentColor" : "none"}
                    fillOpacity={on ? 0.18 : 0}
                    strokeWidth={on ? 1.5 : 1}
                  />
                );
              }),
            )}
          </g>
        );
      })}
      <path d="M20 280.5h440" strokeWidth="1.5" />
    </svg>
  );
}

/** A course of running-bond bricks used as a section divider. */
export function BrickCourse({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 14" className={className} fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0.5 0.5h119v13H0.5zM0 7h120M40.5 0v7M80.5 0v7M20.5 7v7M60.5 7v7M100.5 7v7" />
    </svg>
  );
}
