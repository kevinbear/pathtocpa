const STEPS: { main: string; sub: string; party: "cba" | "nasba" | "prometric" }[] = [
  { main: "Apply", sub: "+ transcripts → CBA", party: "cba" },
  { main: "Approval", sub: "CBA reviews education", party: "cba" },
  { main: "Pick sections", sub: "→ ATT to NASBA", party: "cba" },
  { main: "Pay NASBA", sub: "payment coupon", party: "nasba" },
  { main: "Get NTS", sub: "issued by NASBA", party: "nasba" },
  { main: "Schedule & sit", sub: "Prometric", party: "prometric" },
];

const DOT: Record<string, string> = {
  cba: "rgb(var(--brand-500))",
  nasba: "#f59e0b",
  prometric: "rgb(var(--c-slate-400))",
};

const BOX_W = 176;
const STEP_X = 198;
const X0 = 8;

/** A horizontal flow of the CPA exam application: who hands off to whom. */
export default function ExamFlowDiagram() {
  return (
    <div className="mb-4 overflow-x-auto rounded-2xl bg-slate-50 p-4">
      <svg
        viewBox="0 0 1196 174"
        className="h-auto w-full min-w-[56rem]"
        role="img"
        aria-label="CPA exam application flow: apply and send transcripts to the CBA, the CBA approves your education, you pick exam sections which sends your Authorization to Test to NASBA, you pay NASBA, NASBA issues your Notice to Schedule, then you schedule and sit at Prometric."
      >
        {/* Legend */}
        <g fontSize="12.5" fill="rgb(var(--c-slate-500))">
          <circle cx={12} cy={16} r={5} fill={DOT.cba} />
          <text x={24} y={20}>CBA</text>
          <circle cx={78} cy={16} r={5} fill={DOT.nasba} />
          <text x={90} y={20}>NASBA</text>
          <circle cx={156} cy={16} r={5} fill={DOT.prometric} />
          <text x={168} y={20}>Prometric</text>
        </g>

        {STEPS.map((s, i) => {
          const x = X0 + i * STEP_X;
          return (
            <g key={s.main}>
              <rect
                x={x}
                y={56}
                width={BOX_W}
                height={88}
                rx={12}
                fill="rgb(var(--c-white))"
                stroke="rgb(var(--c-slate-200))"
              />
              <circle cx={x + 18} cy={84} r={5} fill={DOT[s.party]} />
              <text
                x={x + 32}
                y={89}
                fontSize="15"
                fontWeight="600"
                fill="rgb(var(--foreground))"
              >
                {s.main}
              </text>
              <text x={x + 18} y={120} fontSize="12" fill="rgb(var(--c-slate-500))">
                {s.sub}
              </text>
              {i < STEPS.length - 1 && (
                <path
                  d={`M${x + BOX_W + 4} 100 L${x + STEP_X - 6} 100`}
                  stroke="rgb(var(--c-slate-400))"
                  strokeWidth={2}
                  markerEnd="url(#exam-flow-arrow)"
                />
              )}
            </g>
          );
        })}

        <defs>
          <marker
            id="exam-flow-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0 0 L7 4 L0 8 z" fill="rgb(var(--c-slate-400))" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
