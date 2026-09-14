import type { CSSProperties } from 'react'

interface SystemDocsProps {
  onEnter: () => void
  darkMode: boolean
  toggleDark: () => void
}

const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
const MONO = "'JetBrains Mono', 'Courier New', monospace"

/* ─────────────────────────────────────────────────────────────
   ARCHITECTURE DIAGRAM
───────────────────────────────────────────────────────────── */
function ArchDiagram({ darkMode: dm }: { darkMode: boolean }) {
  const arrowFill  = dm ? '#94A3B8' : '#475569'
  const dashFill   = '#B45309'
  const labelFill  = dm ? '#94A3B8' : '#6B7280'
  const subFill    = dm ? '#8dc6ff' : '#e4f1fe'

  // Business-logic module centres (x): modules start at 22, w=154, gap=10
  // x: 22,186,350,514,678  →  centres: 99,263,427,591,755
  const modCx = [99, 263, 427, 591, 755]
  // Presentation box centres (x): boxes start at 22, w=196, gap=14
  // x: 22,232,442,652  →  centres: 120,330,540,750
  const presCx = [120, 330, 540, 750]

  return (
    <svg viewBox="0 0 880 532" style={{ width: '100%', display: 'block', padding: '12px' }}
         xmlns="http://www.w3.org/2000/svg" aria-label="OJTern System Architecture Diagram">
      <defs>
        <marker id="arch-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
          <polygon points="0 0, 9 3.5, 0 7" fill={arrowFill} />
        </marker>
        <marker id="arch-dash" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
          <polygon points="0 0, 9 3.5, 0 7" fill={dashFill} />
        </marker>
      </defs>

      {/* ═══ LAYER 1: PRESENTATION ═══ */}
      <rect x="10" y="8" width="860" height="112" rx="8"
        fill={dm ? '#1c2a35' : '#e4f1fe'} stroke="#8dc6ff" strokeWidth="1.5"/>
      <text x="20" y="24" fontSize="8.5" fontWeight="700"
        fill={dm ? '#8dc6ff' : '#22313f'} fontFamily={FONT}
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Presentation Layer — Role-Based React 19 + Vite Clients (4 SPAs)
      </text>

      {(['Student\nClient','Industry Partner\nClient','OJT Coordinator\nClient','School\nAdministrator'] as const)
        .map((lbl, i) => {
          const bx = [22, 232, 442, 652][i]
          const lines = lbl.split('\n')
          return (
            <g key={i}>
              <rect x={bx} y="32" width="196" height="78" rx="6"
                fill={dm ? '#2c3d4f' : '#22313f'} stroke="#34495e" strokeWidth="1"/>
              <text x={bx + 98} y="62" fontSize="11.5" fontWeight="700" fill="white"
                textAnchor="middle" fontFamily={FONT}>{lines[0]}</text>
              <text x={bx + 98} y="78" fontSize="11.5" fontWeight="700" fill="white"
                textAnchor="middle" fontFamily={FONT}>{lines[1]}</text>
              <text x={bx + 98} y="100" fontSize="8.5" fill={subFill}
                textAnchor="middle" fontFamily={FONT}>React 19 + Vite + TypeScript</text>
            </g>
          )
        })}

      {/* Pres → API arrows */}
      {presCx.map(cx => (
        <line key={cx} x1={cx} y1="110" x2={cx} y2="142"
          stroke={arrowFill} strokeWidth="1.5" markerEnd="url(#arch-arrow)"/>
      ))}
      <text x="440" y="131" fontSize="8" fill={labelFill} textAnchor="middle" fontFamily={FONT}>
        HTTPS · JWT Bearer Token
      </text>

      {/* ═══ LAYER 2: API GATEWAY ═══ */}
      <rect x="10" y="140" width="860" height="72" rx="8"
        fill={dm ? '#082f49' : '#f0f9ff'} stroke="#7dd3fc" strokeWidth="1.5"/>
      <text x="20" y="158" fontSize="8.5" fontWeight="700"
        fill={dm ? '#38bdf8' : '#0369a1'} fontFamily={FONT}
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        API &amp; Security Layer
      </text>
      <rect x="24" y="162" width="832" height="44" rx="5"
        fill={dm ? '#0369a1' : '#0284c7'} stroke="#0369a1" strokeWidth="1"/>
      <text x="440" y="178" fontSize="12" fontWeight="700" fill="white"
        textAnchor="middle" fontFamily={FONT}>
        REST API Gateway — Node.js 20 + Express 4
      </text>
      <text x="440" y="196" fontSize="9" fill="#bae6fd"
        textAnchor="middle" fontFamily={FONT}>
        JWT Auth Middleware · RBAC Route Guards · Request Validation · Rate Limiting (express-rate-limit)
      </text>

      {/* API → BL arrows (fan to each module) */}
      {modCx.map(cx => (
        <line key={cx} x1={cx} y1="206" x2={cx} y2="236"
          stroke={arrowFill} strokeWidth="1.5" markerEnd="url(#arch-arrow)"/>
      ))}

      {/* ═══ LAYER 3: BUSINESS LOGIC ═══ */}
      <rect x="10" y="233" width="860" height="114" rx="8"
        fill={dm ? '#1c2a35' : '#f0f7fe'} stroke="#8dc6ff" strokeWidth="1.5"/>
      <text x="20" y="250" fontSize="8.5" fontWeight="700"
        fill={dm ? '#8dc6ff' : '#34495e'} fontFamily={FONT}
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Business Logic Layer — Stateless Independent Modules (no direct DB access)
      </text>

      {([
        { t1: 'Profile',         t2: 'Management',      n1: 'Profiles · Skills',       n2: 'Company registration' },
        { t1: 'Matching &',      t2: 'Recommendation',  n1: 'Rule-based · stateless',  n2: 'BR-04' },
        { t1: 'Application',     t2: 'Management',      n1: 'Lifecycle · BR-01',       n2: 'BR-02 · BR-03' },
        { t1: 'Notification',    t2: 'Management',      n1: 'In-system alerts',        n2: 'Email dispatch' },
        { t1: 'Reporting',       t2: 'Module',          n1: 'Monthly placement',       n2: 'CSV · PDF export' },
      ] as const).map(({ t1, t2, n1, n2 }, i) => {
        const bx = [22, 186, 350, 514, 678][i]
        return (
          <g key={i}>
            <rect x={bx} y="257" width="154" height="84" rx="5"
              fill={dm ? '#2c3d4f' : '#34495e'} stroke="#22313f" strokeWidth="1"/>
            <text x={bx + 77} y="281" fontSize="11" fontWeight="700" fill="white"
              textAnchor="middle" fontFamily={FONT}>{t1}</text>
            <text x={bx + 77} y="297" fontSize="11" fontWeight="700" fill="white"
              textAnchor="middle" fontFamily={FONT}>{t2}</text>
            <text x={bx + 77} y="320" fontSize="8" fill="#8dc6ff"
              textAnchor="middle" fontFamily={FONT}>{n1}</text>
            <text x={bx + 77} y="333" fontSize="8" fill="#8dc6ff"
              textAnchor="middle" fontFamily={FONT}>{n2}</text>
          </g>
        )
      })}

      {/* BL → DAL arrows */}
      {modCx.map(cx => (
        <line key={cx} x1={cx} y1="341" x2={cx} y2="362"
          stroke={arrowFill} strokeWidth="1.5" markerEnd="url(#arch-arrow)"/>
      ))}

      {/* ═══ LAYER 4: DATA ACCESS ═══ */}
      <rect x="10" y="359" width="860" height="50" rx="8"
        fill={dm ? '#052e16' : '#f0fdf4'} stroke="#6ee7b7" strokeWidth="1.5"/>
      <text x="20" y="376" fontSize="8.5" fontWeight="700"
        fill={dm ? '#34d399' : '#065f46'} fontFamily={FONT}
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Data Access Layer
      </text>
      <rect x="24" y="378" width="832" height="26" rx="5"
        fill={dm ? '#065f46' : '#059669'} stroke="#047857" strokeWidth="1"/>
      <text x="440" y="388" fontSize="11" fontWeight="700" fill="white"
        textAnchor="middle" fontFamily={FONT}>
        Sequelize ORM — Shared Repository Layer (all modules route through this; never direct DB access)
      </text>
      <text x="440" y="400" fontSize="8.5" fill="#a7f3d0"
        textAnchor="middle" fontFamily={FONT}>
        Models · Migrations · Transactions · Query Builders · Data Validation
      </text>

      {/* DAL → DB arrow */}
      <line x1="440" y1="409" x2="440" y2="434"
        stroke={arrowFill} strokeWidth="1.5" markerEnd="url(#arch-arrow)"/>

      {/* ═══ DATABASE ═══ */}
      <rect x="308" y="434" width="264" height="64" rx="8"
        fill={dm ? '#431407' : '#fff7ed'} stroke="#f97316" strokeWidth="2"/>
      <text x="440" y="459" fontSize="13" fontWeight="800"
        fill={dm ? '#fb923c' : '#c2410c'} textAnchor="middle" fontFamily={FONT}>
        MySQL 8 — Relational Database
      </text>
      <text x="440" y="475" fontSize="8.5"
        fill={dm ? '#fdba74' : '#9a3412'} textAnchor="middle" fontFamily={MONO}>
        Users · StudentProfiles · CompanyProfiles · Postings · Applications · Notifications
      </text>
      <text x="440" y="490" fontSize="8"
        fill={dm ? '#f97316' : '#b45309'} textAnchor="middle" fontFamily={FONT}>
        Single source of truth · Sequelize Migrations
      </text>

      {/* ═══ EXTERNAL SERVICES (dashed) ═══ */}
      <rect x="12" y="434" width="190" height="64" rx="7"
        fill={dm ? '#1c1008' : '#fffbeb'} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 3"/>
      <text x="107" y="456" fontSize="11" fontWeight="700"
        fill={dm ? '#fbbf24' : '#92400e'} textAnchor="middle" fontFamily={FONT}>
        ☁ Cloud File Storage
      </text>
      <text x="107" y="471" fontSize="9"
        fill={dm ? '#d97706' : '#b45309'} textAnchor="middle" fontFamily={FONT}>
        AWS S3 / Cloudinary
      </text>
      <text x="107" y="485" fontSize="8"
        fill={dm ? '#d97706' : '#78350f'} textAnchor="middle" fontFamily={FONT}>
        Endorsement PDF uploads
      </text>

      <rect x="678" y="434" width="190" height="64" rx="7"
        fill={dm ? '#1c1008' : '#fffbeb'} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 3"/>
      <text x="773" y="456" fontSize="11" fontWeight="700"
        fill={dm ? '#fbbf24' : '#92400e'} textAnchor="middle" fontFamily={FONT}>
        ✉ Email Notification
      </text>
      <text x="773" y="471" fontSize="9"
        fill={dm ? '#d97706' : '#b45309'} textAnchor="middle" fontFamily={FONT}>
        Nodemailer / AWS SES
      </text>
      <text x="773" y="485" fontSize="8"
        fill={dm ? '#d97706' : '#78350f'} textAnchor="middle" fontFamily={FONT}>
        Status-change email alerts
      </text>

      {/* Dashed: Application Mgmt (cx=427) → Cloud Storage (cx=107) */}
      <path d="M 427 341 C 427 393 107 393 107 434"
        fill="none" stroke={dashFill} strokeWidth="1.5" strokeDasharray="6 3"
        markerEnd="url(#arch-dash)"/>
      <rect x="187" y="382" width="106" height="14" rx="3"
        fill={dm ? '#2c3d4f' : '#fffbeb'}/>
      <text x="240" y="393" fontSize="7.5" fill={dashFill}
        textAnchor="middle" fontFamily={FONT}>PDF upload (direct)</text>

      {/* Dashed: Notification Mgmt (cx=591) → Email Service (cx=773) */}
      <path d="M 591 341 C 591 393 773 393 773 434"
        fill="none" stroke={dashFill} strokeWidth="1.5" strokeDasharray="6 3"
        markerEnd="url(#arch-dash)"/>
      <rect x="620" y="382" width="108" height="14" rx="3"
        fill={dm ? '#2c3d4f' : '#fffbeb'}/>
      <text x="674" y="393" fontSize="7.5" fill={dashFill}
        textAnchor="middle" fontFamily={FONT}>email send (direct)</text>

      {/* Legend */}
      <g transform="translate(12,516)">
        <line x1="0" y1="6" x2="28" y2="6" stroke={arrowFill} strokeWidth="1.5"
          markerEnd="url(#arch-arrow)"/>
        <text x="33" y="10" fontSize="8" fill={labelFill} fontFamily={FONT}>
          Internal request flow (solid line)
        </text>
        <line x1="210" y1="6" x2="238" y2="6" stroke={dashFill} strokeWidth="1.5"
          strokeDasharray="5 3" markerEnd="url(#arch-dash)"/>
        <text x="243" y="10" fontSize="8" fill={dashFill} fontFamily={FONT}>
          External service call (dashed — bypasses Sequelize ORM)
        </text>
      </g>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   SITE MAP DIAGRAM
───────────────────────────────────────────────────────────── */
function SiteMapDiagram({ darkMode: dm }: { darkMode: boolean }) {
  const arrowFill  = dm ? '#94a3b8' : '#475569'
  const crossFill  = '#ea580c'  // orange — cross-role arrows

  // Lane geometry
  const LANE_H   = 88
  const BOX_H    = 54
  const BOX_W    = 118
  const GAP      = 14
  const LBL_W    = 130   // left label column width
  const START_X  = LBL_W + 8

  // 5 box x positions per lane
  const bx = Array.from({ length: 5 }, (_, i) => START_X + i * (BOX_W + GAP))

  const laneCy = (laneIdx: number) => 10 + laneIdx * (LANE_H + 6) + LANE_H / 2
  const boxY   = (laneIdx: number) => laneCy(laneIdx) - BOX_H / 2

  type LaneConfig = {
    role: string
    fill: string
    stroke: string
    hdrFill: string
    icon: string
    boxes: string[][]  // [line1, line2] per box
  }

  const lanes: LaneConfig[] = [
    {
      role: 'Student',
      fill: dm ? '#1c2a35' : '#e4f1fe',
      stroke: '#8dc6ff',
      hdrFill: dm ? '#2c3d4f' : '#22313f',
      icon: '👤',
      boxes: [
        ['Landing /', 'Login'],
        ['Student Profile', 'Builder'],
        ['Recommended', 'Internships'],
        ['Internship Detail', '/ Apply'],
        ['My Applications', 'Status Tracker'],
      ],
    },
    {
      role: 'Industry Partner',
      fill: dm ? '#082f49' : '#f0f9ff',
      stroke: '#7dd3fc',
      hdrFill: dm ? '#0369a1' : '#0284c7',
      icon: '🏢',
      boxes: [
        ['Landing /', 'Login'],
        ['Company', 'Profile'],
        ['Post Internship', 'Opportunity'],
        ['Company Postings', 'List'],
        ['Screen', 'Applicants'],
      ],
    },
    {
      role: 'OJT Coordinator',
      fill: dm ? '#1c2a35' : '#f0f7fe',
      stroke: '#8dc6ff',
      hdrFill: dm ? '#2c3d4f' : '#34495e',
      icon: '🗂️',
      boxes: [
        ['Landing /', 'Login'],
        ['Coordinator', 'Dashboard'],
        ['Applications', 'Queue'],
        ['App. Detail /', 'Review'],
        ['Generate', 'Placement Report'],
      ],
    },
    {
      role: 'School Administrator',
      fill: dm ? '#052e16' : '#f0fdf4',
      stroke: '#6ee7b7',
      hdrFill: dm ? '#065f46' : '#059669',
      icon: '⚙️',
      boxes: [
        ['Landing /', 'Login'],
        ['Admin', 'Dashboard'],
        ['Manage', 'Users'],
        ['View Reports &', 'Statistics'],
        ['', ''],  // empty 5th slot for admin
      ],
    },
  ]

  const totalH = 10 + lanes.length * (LANE_H + 6) + 44  // +44 for legend

  return (
    <svg
      viewBox={`0 0 950 ${totalH}`}
      style={{ width: '100%', display: 'block', padding: '12px' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="OJTern Site Map and Navigation Flow"
    >
      <defs>
        <marker id="map-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
          <polygon points="0 0, 9 3.5, 0 7" fill={arrowFill} />
        </marker>
        <marker id="map-cross" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
          <polygon points="0 0, 9 3.5, 0 7" fill={crossFill} />
        </marker>
        <marker id="map-cross-rev" markerWidth="9" markerHeight="7" refX="1" refY="3.5" orient="auto">
          <polygon points="9 0, 0 3.5, 9 7" fill={crossFill} />
        </marker>
      </defs>

      {/* ─── Lane backgrounds + headers ─── */}
      {lanes.map((lane, li) => {
        const ly = 10 + li * (LANE_H + 6)
        const cy = laneCy(li)
        const by = boxY(li)

        return (
          <g key={li}>
            {/* Lane stripe */}
            <rect x="0" y={ly} width="940" height={LANE_H} rx="6"
              fill={lane.fill} stroke={lane.stroke} strokeWidth="1.2"/>

            {/* Lane header block */}
            <rect x="2" y={ly + 2} width={LBL_W - 4} height={LANE_H - 4} rx="5"
              fill={lane.hdrFill}/>
            <text x={LBL_W / 2} y={cy - 8} fontSize="11" fontWeight="700" fill="white"
              textAnchor="middle" fontFamily={FONT}>{lane.icon}</text>
            <text x={LBL_W / 2} y={cy + 6} fontSize="9.5" fontWeight="700" fill="white"
              textAnchor="middle" fontFamily={FONT}>
              {lane.role.split(' ')[0]}
            </text>
            {lane.role.split(' ').length > 1 && (
              <text x={LBL_W / 2} y={cy + 20} fontSize="9.5" fontWeight="700" fill="white"
                textAnchor="middle" fontFamily={FONT}>
                {lane.role.split(' ').slice(1).join(' ')}
              </text>
            )}

            {/* Boxes */}
            {lane.boxes.map((lbls, bi) => {
              if (lbls[0] === '' && lbls[1] === '') return null  // skip empty slot
              const boxIsLogin = bi === 0
              return (
                <g key={bi}>
                  <rect x={bx[bi]} y={by} width={BOX_W} height={BOX_H} rx="5"
                    fill={boxIsLogin ? (dm ? '#374151' : '#f1f5f9') : lane.hdrFill}
                    stroke={boxIsLogin ? (dm ? '#6b7280' : '#cbd5e1') : lane.stroke}
                    strokeWidth={boxIsLogin ? 1 : 1.2}/>
                  <text
                    x={bx[bi] + BOX_W / 2} y={by + 21}
                    fontSize="9.5" fontWeight={boxIsLogin ? '500' : '700'}
                    fill={boxIsLogin ? (dm ? '#cbd5e1' : '#374151') : 'white'}
                    textAnchor="middle" fontFamily={FONT}
                  >
                    {lbls[0]}
                  </text>
                  <text
                    x={bx[bi] + BOX_W / 2} y={by + 37}
                    fontSize="9.5" fontWeight={boxIsLogin ? '500' : '700'}
                    fill={boxIsLogin ? (dm ? '#cbd5e1' : '#374151') : 'white'}
                    textAnchor="middle" fontFamily={FONT}
                  >
                    {lbls[1]}
                  </text>
                </g>
              )
            })}

            {/* Within-lane arrows */}
            {lane.boxes.map((lbls, bi) => {
              if (bi >= lane.boxes.length - 1) return null
              // skip empty boxes (admin lane only has 4 boxes, 5th is empty)
              if (lane.boxes[bi][0] === '' || lane.boxes[bi + 1][0] === '') return null
              const fromX = bx[bi] + BOX_W
              const toX   = bx[bi + 1]
              return (
                <line key={bi} x1={fromX} y1={cy} x2={toX} y2={cy}
                  stroke={arrowFill} strokeWidth="1.5" markerEnd="url(#map-arrow)"/>
              )
            })}
          </g>
        )
      })}

      {/* ─── Cross-role arrow 1:
           Partner "Post Internship Opportunity" (lane 1, box 2)
           → Student "Recommended Internships" (lane 0, box 2)
      ─── */}
      {(() => {
        const srcLane = 1   // Partner
        const srcBox  = 2   // Post Internship Opportunity
        const tgtLane = 0   // Student
        const tgtBox  = 2   // Recommended Internships

        const srcCx = bx[srcBox] + BOX_W / 2
        const srcTopY = boxY(srcLane)           // top of Partner box
        const tgtBotY = boxY(tgtLane) + BOX_H  // bottom of Student box

        const midY = (srcTopY + tgtBotY) / 2

        return (
          <g key="cross1">
            {/* Vertical up arrow */}
            <line x1={srcCx} y1={srcTopY} x2={srcCx} y2={tgtBotY}
              stroke={crossFill} strokeWidth="2" markerEnd="url(#map-cross)"/>
            {/* Label */}
            <rect x={srcCx + 4} y={midY - 10} width="96" height="22" rx="3"
              fill={dm ? '#2c3d4f' : '#fff7ed'} stroke={crossFill} strokeWidth="0.8"/>
            <text x={srcCx + 52} y={midY + 3} fontSize="7.5" fill={crossFill}
              textAnchor="middle" fontFamily={FONT}>New posting feeds</text>
            <text x={srcCx + 52} y={midY + 12} fontSize="7.5" fill={crossFill}
              textAnchor="middle" fontFamily={FONT}>recommendations</text>
          </g>
        )
      })()}

      {/* ─── Cross-role arrow 2:
           Coordinator "App. Detail / Review" (lane 2, box 3)
           → Student "My Applications / Status Tracker" (lane 0, box 4)
      ─── */}
      {(() => {
        const srcLane = 2   // Coordinator
        const srcBox  = 3   // App Detail/Review
        const tgtLane = 0   // Student
        const tgtBox  = 4   // My Applications

        const srcCx = bx[srcBox] + BOX_W / 2
        const tgtCx = bx[tgtBox] + BOX_W / 2

        const srcTopY = boxY(srcLane)
        const tgtBotY = boxY(tgtLane) + BOX_H

        // Route: up from Coordinator box top, curve right and up to Student box bottom
        const routeY = laneCy(tgtLane + 1) - LANE_H / 2 - 3  // in the gap between Student & Partner lanes

        return (
          <g key="cross2">
            <path
              d={`M ${srcCx} ${srcTopY} L ${srcCx} ${routeY} L ${tgtCx} ${routeY} L ${tgtCx} ${tgtBotY}`}
              fill="none" stroke={crossFill} strokeWidth="2"
              strokeDasharray="5 3" markerEnd="url(#map-cross)"/>
            {/* Label */}
            <rect x={(srcCx + tgtCx) / 2 - 56} y={routeY - 14} width="112" height="13" rx="3"
              fill={dm ? '#2c3d4f' : '#fff7ed'} stroke={crossFill} strokeWidth="0.8"/>
            <text x={(srcCx + tgtCx) / 2} y={routeY - 4} fontSize="7.5" fill={crossFill}
              textAnchor="middle" fontFamily={FONT}>
              Coordinator decision updates Student status
            </text>
          </g>
        )
      })()}

      {/* ─── Legend ─── */}
      {(() => {
        const ly = 10 + lanes.length * (LANE_H + 6) + 8
        return (
          <g key="legend" transform={`translate(12,${ly})`}>
            <line x1="0" y1="7" x2="26" y2="7" stroke={arrowFill} strokeWidth="1.5"
              markerEnd="url(#map-arrow)"/>
            <text x="31" y="11" fontSize="8" fill={dm ? '#94a3b8' : '#475569'} fontFamily={FONT}>
              Navigation flow (same role)
            </text>
            <line x1="190" y1="7" x2="216" y2="7" stroke={crossFill} strokeWidth="2"/>
            <polygon points="216,4 225,7 216,10" fill={crossFill}/>
            <text x="231" y="11" fontSize="8" fill={crossFill} fontFamily={FONT}>
              Cross-role data flow (solid orange — posting feeds recommendations)
            </text>
            <line x1="570" y1="7" x2="596" y2="7" stroke={crossFill} strokeWidth="2"
              strokeDasharray="5 3"/>
            <polygon points="596,4 605,7 596,10" fill={crossFill}/>
            <text x="611" y="11" fontSize="8" fill={crossFill} fontFamily={FONT}>
              Cross-role status update (dashed orange — coordinator decision → student tracker)
            </text>
          </g>
        )
      })()}
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function SystemDocs({ onEnter, darkMode: dm, toggleDark }: SystemDocsProps) {
  const page: CSSProperties = {
    backgroundColor: dm ? '#22313f' : '#ffffff',
    color: dm ? '#e4f1fe' : '#22313f',
    minHeight: '100vh',
    fontFamily: FONT,
  }

  const wrap: CSSProperties = {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '36px 28px 56px',
  }

  const divider: CSSProperties = {
    border: 'none',
    borderTop: `1px solid ${dm ? '#2c3d4f' : '#e2e8f0'}`,
    margin: '32px 0',
  }

  const sectionTitle: CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: dm ? '#8dc6ff' : '#22313f',
    marginBottom: '6px',
    marginTop: 0,
  }

  const sectionBody: CSSProperties = {
    fontSize: '12px',
    lineHeight: 1.7,
    color: dm ? '#94a3b8' : '#4b5563',
    marginTop: 0,
    marginBottom: '16px',
  }

  const figCaption: CSSProperties = {
    fontSize: '11px',
    fontStyle: 'italic',
    color: dm ? '#64748b' : '#9ca3af',
    marginTop: '10px',
    lineHeight: 1.6,
  }

  const diagramWrap: CSSProperties = {
    border: `1px solid ${dm ? '#2c3d4f' : '#e2e8f0'}`,
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: dm ? '#22313f' : '#fafbfe',
  }

  return (
    <div style={page}>
      {/* ── Top bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 24px',
        borderBottom: `1px solid ${dm ? '#2c3d4f' : '#e5e7eb'}`,
        backgroundColor: dm ? '#22313f' : '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, backgroundColor: '#22313f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 13, fontFamily: FONT,
          }}>O</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: dm ? '#e4f1fe' : '#22313f', fontFamily: FONT }}>
            OJTern
          </span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 99,
            backgroundColor: dm ? '#1c2a35' : '#e4f1fe',
            color: dm ? '#8dc6ff' : '#22313f', fontWeight: 600,
          }}>
            System Documentation
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleDark} style={{
            width: 30, height: 30, borderRadius: 7, border: `1px solid ${dm ? '#2c3d4f' : '#e2e8f0'}`,
            backgroundColor: dm ? '#2c3d4f' : '#f8fafc', cursor: 'pointer', fontSize: 14,
          }}>{dm ? '☀️' : '🌙'}</button>
          <button onClick={onEnter} style={{
            padding: '5px 14px', borderRadius: 7, border: 'none',
            backgroundColor: '#22313f', color: 'white',
            fontFamily: FONT, fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}>Enter Platform →</button>
        </div>
      </div>

      {/* ── Document content ── */}
      <div style={wrap}>

        {/* ── Project header ── */}
        <div style={{ textAlign: 'center', paddingBottom: '28px', borderBottom: `1px solid ${dm ? '#2c3d4f' : '#e2e8f0'}`, marginBottom: '32px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: dm ? '#8dc6ff' : '#22313f', textTransform: 'uppercase' }}>
            ITPD 4 Section 1 — Team DUTERTECH
          </p>
          <h1 style={{ margin: '0 0 4px', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: dm ? '#e4f1fe' : '#22313f', letterSpacing: '-0.02em' }}>
            OJTern
          </h1>
          <p style={{ margin: '0 0 4px', fontFamily: FONT, fontWeight: 500, fontSize: 16, color: dm ? '#94a3b8' : '#374151' }}>
            Smart Web-Based OJT Matching &amp; Recommendation Platform
          </p>
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 12, color: dm ? '#4f6272' : '#94a3b8' }}>
            System Architecture &amp; Site Map — Design &amp; Architecture Package
          </p>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 1 — SYSTEM ARCHITECTURE
        ══════════════════════════════════════════ */}
        <section>
          <p style={sectionTitle}>Section 1 — System Architecture Diagram</p>
          <p style={sectionBody}>
            The diagram below shows OJTern's layered 3-tier client-server architecture, read top-to-bottom.
            The <strong>Presentation Layer</strong> hosts four independent role-based React + Vite SPAs.
            All client requests are routed exclusively through the <strong>API Gateway</strong> (Node.js + Express),
            which enforces JWT authentication and RBAC before dispatching to one of five stateless
            <strong> Business Logic Modules</strong>. Every module accesses persisted data only through the shared
            <strong> Sequelize ORM</strong> (Data Access Layer) — never via raw SQL to MySQL directly.
            Two external services (<em>Cloud File Storage</em> and <em>Email Notification</em>) are called
            directly from the relevant business modules and are shown with dashed connectors to
            indicate they bypass the ORM by design.
          </p>

          <div style={diagramWrap}>
            <ArchDiagram darkMode={dm} />
          </div>

          <p style={figCaption}>
            <strong>Figure 1.</strong> OJTern 3-Tier Layered Architecture. Solid arrows represent
            internal HTTPS request flow; dashed amber arrows represent direct calls to external
            third-party services. The Sequelize ORM is the <em>sole</em> point of database contact for
            all five business-logic modules, enforcing separation between domain logic and persistence.
          </p>
        </section>

        <hr style={divider} />

        {/* ══════════════════════════════════════════
            SECTION 2 — SITE MAP
        ══════════════════════════════════════════ */}
        <section>
          <p style={sectionTitle}>Section 2 — Site Map / Navigation Flow</p>
          <p style={sectionBody}>
            The swim-lane diagram below maps the screen-by-screen navigation flow for each of the
            four authenticated portals. Each lane represents a distinct role protected by JWT + RBAC;
            all flows begin at the shared <em>Landing / Login</em> entry point. Two cross-role
            interactions are highlighted in <span style={{ color: '#ea580c', fontWeight: 600 }}>orange</span>:
            (1) a posting created in the <em>Industry Partner</em> lane is picked up by the rule-based
            recommendation engine and surfaces in the <em>Student</em> lane's Recommended Internships
            screen; and (2) a coordinator approval or correction decision in the <em>OJT Coordinator</em>
            lane propagates immediately to the <em>Student</em> lane's Application Status Tracker.
          </p>

          <div style={diagramWrap}>
            <SiteMapDiagram darkMode={dm} />
          </div>

          <p style={figCaption}>
            <strong>Figure 2.</strong> OJTern Site Map — four role-based portal flows (Student, Industry Partner,
            OJT Coordinator, School Administrator). Solid grey arrows indicate same-role navigation transitions.
            Orange arrows mark enforced cross-role data flows: a solid orange arrow for the posting-to-recommendations
            feed (BR-04) and a dashed orange arrow for the coordinator-decision-to-status-tracker update (BR-02).
          </p>
        </section>

        <hr style={divider} />

        {/* ── Business Rules Quick-Reference ── */}
        <section>
          <p style={sectionTitle}>Business Rules Referenced in Diagrams</p>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: 12, fontFamily: FONT,
          }}>
            <thead>
              <tr style={{ backgroundColor: dm ? '#2c3d4f' : '#f8fafc' }}>
                {['Rule', 'Name', 'Description', 'Enforced By'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: dm ? '#94a3b8' : '#6b7280', fontWeight: 600,
                    borderBottom: `1px solid ${dm ? '#2c3d4f' : '#e5e7eb'}`,
                    fontSize: 11,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'BR-01', name: 'Endorsement Document Required',   desc: 'System blocks application submission if no PDF endorsement is attached.',                          by: 'Application Management' },
                { id: 'BR-02', name: 'Coordinator Verification Gate',   desc: 'Applications only become visible to Industry Partners after Coordinator approval.',               by: 'Application Management' },
                { id: 'BR-03', name: 'Partner Restricted View',         desc: 'Partners see only Coordinator-approved applicants; unapproved applications are hidden.',           by: 'RBAC Guard' },
                { id: 'BR-04', name: 'Rule-Based Matching (no ML)',     desc: 'Match score = Program (40 %) + Skill overlap (40 %) + Location (20 %). Deterministic.',           by: 'Matching / Recommendation' },
                { id: 'BR-05', name: 'Accepted Status Immutability',    desc: 'Once an application is Partner-Accepted, no role may further change its status.',                 by: 'Application Management' },
              ].map((r, i) => (
                <tr key={r.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : (dm ? '#0f172a' : '#f9fafb') }}>
                  <td style={{ padding: '8px 12px', fontFamily: MONO, fontWeight: 700, color: '#22313f', borderBottom: `1px solid ${dm ? '#2c3d4f' : '#f1f5f9'}`, fontSize: 11 }}>
                    {r.id}
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: dm ? '#e2e8f0' : '#111827', borderBottom: `1px solid ${dm ? '#2c3d4f' : '#f1f5f9'}` }}>
                    {r.name}
                  </td>
                  <td style={{ padding: '8px 12px', color: dm ? '#94a3b8' : '#4b5563', borderBottom: `1px solid ${dm ? '#2c3d4f' : '#f1f5f9'}` }}>
                    {r.desc}
                  </td>
                  <td style={{ padding: '8px 12px', color: dm ? '#8dc6ff' : '#34495e', fontWeight: 600, borderBottom: `1px solid ${dm ? '#2c3d4f' : '#f1f5f9'}` }}>
                    {r.by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Footer ── */}
        <div style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: `1px solid ${dm ? '#2c3d4f' : '#e2e8f0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 11, color: dm ? '#4b5563' : '#9ca3af', fontFamily: MONO }}>
            OJTern · ITPD 4 Section 1 · Team DUTERTECH · Polytechnic University of the Philippines · 2025
          </span>
          <button onClick={onEnter} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            backgroundColor: '#22313f', color: 'white',
            fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            Enter OJTern Platform →
          </button>
        </div>
      </div>
    </div>
  )
}
