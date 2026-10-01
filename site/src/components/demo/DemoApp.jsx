// The /demo workspace: a fictional client (Kestrel Precision Machining) midway
// through an Eagle Ridge CMMC Level 2 engagement. Layout follows the product
// sketch: left rail · sidebar · tabs + main content · right sidebar · bottom bar.
// All data is static JSON; "what-if" status changes live in this viewer's
// browser only (localStorage, best-effort). Scoring lives in src/lib/sprs.js.
import { useEffect, useMemo, useRef, useState } from 'react';
import controlsData from '../../data/demo/controls.json';
import client from '../../data/demo/client.json';
import { readiness, deduction, poamAllowed, minScore, CONDITIONAL_MIN, MAX_SCORE } from '../../lib/sprs.js';
import './demo.css';

const { controls, families } = controlsData;
const byId = Object.fromEntries(controls.map((c) => [c.id, c]));
const people = Object.fromEntries(client.people.map((p) => [p.id, p]));
const familyName = Object.fromEntries(families.map((f) => [f.code, f.name]));
// The demo's "today" is pinned so the story (dates, countdown) stays coherent.
const TODAY = new Date('2026-10-01T12:00:00');
const STORE_KEY = 'er-demo-whatif-v1';
const WORST = minScore(controls); // -203 with the DoD weights
const STATUSES = ['met', 'partial', 'not_met'];

const ver = (v) => `v${String(v).replace(/^v/i, '')}`;
const STATUS_LABEL = { met: 'Met', partial: 'Partly met', not_met: 'Not met' };

function track(event, props) {
  try { window.posthog?.capture(event, props); } catch { /* analytics is optional */ }
}
// Keep only overrides that still make sense: a known control, a known status,
// and different from the client's real status (stale or hand-edited storage
// would otherwise inflate the what-if count and skew the tallies).
function loadOverrides() {
  let raw;
  try { raw = JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return {}; }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const clean = {};
  for (const [id, st] of Object.entries(raw)) {
    if (client.controls[id] && STATUSES.includes(st) && st !== client.controls[id].status) clean[id] = st;
  }
  return clean;
}
function saveOverrides(o) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(o)); } catch { /* private mode */ }
}
function fmtDate(iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!iso) return '';
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', opts);
}
function daysUntil(iso) {
  return Math.round((new Date(iso + 'T12:00:00') - TODAY) / 86400000);
}
function signed(n) { return n > 0 ? `+${n}` : `${n}`; }
// Tab keys can contain spaces ("Eagle Ridge"); ids and aria-labelledby cannot.
const tabId = (k) => `dm-tab-${k.replace(/\s+/g, '-')}`;

/* ---------- icons (stroke, 24px) ---------- */
const ICONS = {
  home: 'M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0',
  doc: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4L10.7 6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.5z',
  chevron: 'M9 6l6 6-6 6',
  check: 'M5 12l5 5 9-10',
};
function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Avatar({ id, size = 32 }) {
  const p = people[id];
  if (!p) return null;
  const tone = p.org === 'Eagle Ridge' ? 'er' : p.org === 'Kestrel' ? 'kp' : 'it';
  return (
    <span className={`dm-avatar dm-avatar--${tone}`} style={{ width: size, height: size }} title={`${p.name}, ${p.role}`}>
      {p.initials}
    </span>
  );
}

function StatusPill({ status }) {
  return <span className={`dm-pill dm-pill--${status}`}>{STATUS_LABEL[status]}</span>;
}

/* ---------- score gauge: worst case → 110, with the 88 line ---------- */
function Gauge({ score, baseline }) {
  const pct = (v) => ((v - WORST) / (MAX_SCORE - WORST)) * 100;
  return (
    <div className="dm-gauge" role="img"
      aria-label={`SPRS score ${score} on a scale from ${WORST} to ${MAX_SCORE}. ${CONDITIONAL_MIN} is the minimum to certify.`}>
      <div className="dm-gauge__goal" style={{ left: `${pct(CONDITIONAL_MIN)}%` }}>{CONDITIONAL_MIN} to certify</div>
      <div className="dm-gauge__track">
        <div className="dm-gauge__fill" style={{ width: `${pct(score)}%` }} />
        <div className="dm-gauge__mark dm-gauge__mark--base" style={{ left: `${pct(baseline)}%` }} title={`Start: ${baseline}`} />
        <div className="dm-gauge__mark dm-gauge__mark--goal" style={{ left: `${pct(CONDITIONAL_MIN)}%` }} />
      </div>
      <div className="dm-gauge__scale">
        <span>{WORST}</span><span>{MAX_SCORE}</span>
      </div>
    </div>
  );
}

/* ================================================================== */

export default function DemoApp() {
  const [view, setView] = useState('home');
  const [tab, setTab] = useState({ home: 'overview', controls: 'all', activity: 'all', documents: 'preview', settings: 'demo' });
  const [phaseSel, setPhaseSel] = useState(client.phases.find((p) => p.status === 'active')?.n ?? 1);
  const [family, setFamily] = useState('ALL');
  const [openControl, setOpenControl] = useState(null);
  const [query, setQuery] = useState('');
  const [docSel, setDocSel] = useState(client.documents[0]?.id);
  const [personSel, setPersonSel] = useState('ALL');
  const [overrides, setOverrides] = useState({});
  const [doneSteps, setDoneSteps] = useState({});
  const searchRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => { setOverrides(loadOverrides()); track('demo_opened', {}); }, []);
  useEffect(() => { mainRef.current?.scrollTo?.(0, 0); }, [view]);

  const statusOf = (id) => overrides[id] ?? client.controls[id].status;
  const r = useMemo(() => readiness(controls, statusOf), [overrides]);
  const base = useMemo(() => readiness(controls, (id) => client.controls[id].status), []);
  const whatIfCount = Object.keys(overrides).length;

  const mainSecRef = useRef(null);
  function go(v, opts = {}) {
    if (v !== view && !opts.keepOpen) setOpenControl(null);
    setView(v);
    if (opts.tab) setTab((t) => ({ ...t, [v]: opts.tab }));
    track('demo_view', { view: v });
    if (v === 'controls' && opts.focusSearch) setTimeout(() => searchRef.current?.focus(), 0);
    // Stacked (phone) layout: the main pane sits below the rail and sidebar, so bring it into view.
    if (!opts.keepScroll && window.matchMedia?.('(max-width: 760px)').matches) {
      setTimeout(() => mainSecRef.current?.scrollIntoView({ block: 'start' }), 0);
    }
  }
  function setTabFor(v, t) { setTab((x) => ({ ...x, [v]: t })); }
  // Open gaps across every family, with no leftover search narrowing the list.
  function showGaps() { setFamily('ALL'); setQuery(''); go('controls', { tab: 'gaps' }); }
  function openDoc(id) { setDocSel(id); go('documents', { tab: 'preview' }); }
  // WAI-ARIA tabs: roving tabindex, arrows/Home/End move and select.
  function onTabKey(e, keys) {
    const i = keys.indexOf(tab[view]);
    const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: keys.length - 1 }[e.key];
    if (j == null) return;
    e.preventDefault();
    const k = keys[(j + keys.length) % keys.length];
    setTabFor(view, k);
    e.currentTarget.parentElement.querySelector(`[data-tab="${k}"]`)?.focus();
  }
  function setWhatIf(id, status) {
    const next = { ...overrides };
    if (status === client.controls[id].status) delete next[id]; else next[id] = status;
    setOverrides(next); saveOverrides(next);
    track('demo_whatif', { control: id, status });
  }
  function resetWhatIf() { setOverrides({}); saveOverrides({}); track('demo_whatif_reset', {}); }
  function openInControls(id) {
    setFamily('ALL'); setQuery(''); setOpenControl(id); go('controls', { tab: 'all', keepOpen: true, keepScroll: true });
    setTimeout(() => document.getElementById(`dm-c-${id}`)?.scrollIntoView({ block: 'center' }), 50);
  }

  const RAIL = [
    { v: 'home', icon: 'home', label: 'Home' },
    { v: 'controls', icon: 'search', label: 'Controls', focusSearch: true },
    { v: 'activity', icon: 'bell', label: 'Activity', badge: 3 },
    { v: 'documents', icon: 'doc', label: 'Documents' },
    { v: 'settings', icon: 'gear', label: 'Demo settings' },
  ];

  const TABS = {
    home: [['overview', 'Overview'], ['roadmap', 'Roadmap'], ['team', 'Team']],
    controls: [['all', 'All'], ['gaps', `Open gaps (${r.counts.partial + r.counts.not_met})`], ['poam', `POA&M (${r.poamable.length})`]],
    activity: [['all', 'All'], ['Eagle Ridge', 'Eagle Ridge'], ['Kestrel', 'Your team']],
    documents: [['preview', 'Preview'], ['details', 'Details']],
    settings: [['demo', 'About this demo']],
  };

  return (
    <div className="dm-app" data-view={view}>
      {/* ---------------- left rail ---------------- */}
      <nav className="dm-rail" aria-label="Workspace">
        <div className="dm-rail__brand" title="Eagle Ridge Workspace">
          <img src="/favicon.svg" alt="" width="26" height="26" />
        </div>
        {RAIL.map((it) => (
          <button key={it.v} type="button" className="dm-rail__btn" aria-current={view === it.v ? 'page' : undefined}
            aria-label={it.label} title={it.label} onClick={() => go(it.v, { focusSearch: it.focusSearch })}>
            <Icon name={it.icon} />
            {it.badge ? <span className="dm-rail__badge" aria-hidden="true">{it.badge}</span> : null}
            <span className="dm-rail__label">{it.label}</span>
          </button>
        ))}
        <div className="dm-rail__me" title={`Signed in as ${people[client.viewer].name}`}><Avatar id={client.viewer} size={34} /></div>
      </nav>

      {/* ---------------- sidebar ---------------- */}
      <aside className="dm-side" aria-label="Navigator">
        <Sidebar {...{ view, r, phaseSel, setPhaseSel, setTabFor, family, setFamily, statusOf, docSel, setDocSel, personSel, setPersonSel, setOpenControl }} />
      </aside>

      {/* ---------------- tabs + main ---------------- */}
      <section className="dm-main" aria-label="Main content" ref={mainSecRef}>
        <div className="dm-tabs" role="tablist" aria-label="Sections">
          {TABS[view].map(([k, label]) => (
            <button key={k} type="button" role="tab" id={tabId(k)} data-tab={k} aria-selected={tab[view] === k}
              aria-controls="dm-panel" tabIndex={tab[view] === k ? 0 : -1} className="dm-tab"
              onClick={() => setTabFor(view, k)} onKeyDown={(e) => onTabKey(e, TABS[view].map(([x]) => x))}>{label}</button>
          ))}
        </div>
        <div className="dm-main__body" ref={mainRef} id="dm-panel" role="tabpanel" tabIndex={0} aria-labelledby={tabId(tab[view])}>
          {view === 'home' && <Home {...{ tab: tab.home, r, base, phaseSel, setPhaseSel, go, showGaps, openInControls, openDoc, statusOf, whatIfCount }} />}
          {view === 'controls' && <Controls {...{ tab: tab.controls, family, query, setQuery, searchRef, openControl, setOpenControl, statusOf, setWhatIf, overrides }} />}
          {view === 'activity' && <Activity {...{ tab: tab.activity, personSel, openInControls }} />}
          {view === 'documents' && <Documents {...{ tab: tab.documents, docSel, r }} />}
          {view === 'settings' && <Settings {...{ whatIfCount, resetWhatIf, r, base }} />}
        </div>
      </section>

      {/* ---------------- right sidebar ---------------- */}
      <aside className="dm-right" aria-label="Score and next steps">
        <div className="dm-right__block">
          <div className="dm-eyebrow">SPRS score</div>
          <div className="dm-score" aria-live="polite">
            <span className="dm-score__num">{signed(r.score)}</span>
            <span className="dm-score__of">/ {MAX_SCORE}</span>
          </div>
          <Gauge score={r.score} baseline={client.baseline.sprs} />
          <p className="dm-small">
            {r.conditionalReady
              ? 'You meet the bar to certify with a short fix-it plan.'
              : r.pointsToConditional > 0
                ? <>{r.pointsToConditional} points to go to reach {CONDITIONAL_MIN}, the minimum to certify.</>
                : <>Score is high enough, but {r.blocking.length} gap{r.blocking.length === 1 ? '' : 's'} must close before you can certify.</>}
          </p>
          {whatIfCount > 0 && (
            <p className="dm-whatif-note">
              Includes {whatIfCount} what-if change{whatIfCount === 1 ? '' : 's'} ({signed(r.score - base.score)}).{' '}
              <button type="button" className="dm-link" onClick={resetWhatIf}>Reset</button>
            </p>
          )}
        </div>

        <div className="dm-right__block dm-card">
          <div className="dm-eyebrow">This week</div>
          <ul className="dm-steps">
            {client.nextSteps.map((s, i) => (
              <li key={i}>
                <label className={doneSteps[i] ? 'is-done' : ''}>
                  <input type="checkbox" checked={!!doneSteps[i]} onChange={() => setDoneSteps((d) => ({ ...d, [i]: !d[i] }))} />
                  <span>{s.text}<small>{people[s.owner]?.name} · {fmtDate(s.due, { month: 'short', day: 'numeric' })}</small></span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="dm-right__block">
          <div className="dm-eyebrow">Must close before assessment</div>
          <ul className="dm-mini">
            {r.blocking.slice(0, 4).map((id) => (
              <li key={id}>
                <button type="button" className="dm-mini__row" onClick={() => openInControls(id)}>
                  <span className={`dm-dot dm-dot--${statusOf(id)}`} aria-hidden="true" />
                  <span><b>{id}</b> {byId[id].title}</span>
                  <span className="dm-mini__w">−{deduction(byId[id], statusOf(id))}</span>
                </button>
              </li>
            ))}
            {r.blocking.length === 0 && <li className="dm-small">Nothing blocking. Nice work.</li>}
          </ul>
          {r.blocking.length > 4 && (
            <button type="button" className="dm-link" onClick={showGaps}>See all open gaps</button>
          )}
        </div>

        <div className="dm-right__block dm-cta">
          <p><b>Want this view for your company?</b> In a 50-minute call we look at where you stand and what it would take.</p>
          <a className="dm-btn" href="/discovery" data-cta="demo-book-call" data-cta-loc="demo-right">Book a call</a>
        </div>
      </aside>

      {/* ---------------- bottom bar ---------------- */}
      <div className="dm-mbar" aria-hidden="true">
        <span className="dm-mbar__score"><b>{signed(r.score)}</b> SPRS</span>
        {whatIfCount > 0 && <button type="button" tabIndex={-1} className="dm-link" onClick={resetWhatIf}>Reset {whatIfCount} what-if{whatIfCount === 1 ? '' : 's'}</button>}
        <a className="dm-btn" tabIndex={-1} href="/discovery" data-cta="demo-book-call" data-cta-loc="demo-mobile-bar">Book a call</a>
      </div>

      <footer className="dm-bottom">
        <span><b>Demo.</b> {client.company.name} and its people are fictional.</span>
        <span className="dm-bottom__right">
          <span>Phase {client.phases.find((p) => p.status === 'active')?.n} of 7</span>
          <span>Last updated {fmtDate('2026-09-30', { month: 'short', day: 'numeric' })}</span>
        </span>
      </footer>
    </div>
  );
}

/* ================================================================== */

function Sidebar({ view, r, phaseSel, setPhaseSel, setTabFor, family, setFamily, statusOf, docSel, setDocSel, personSel, setPersonSel, setOpenControl }) {
  if (view === 'home') {
    return (
      <>
        <div className="dm-side__head">
          <div className="dm-side__title">{client.company.shortName}</div>
          <div className="dm-small">CMMC Level 2 readiness</div>
        </div>
        <ul className="dm-list">
          {client.phases.map((p) => (
            <li key={p.n}>
              <button type="button" className="dm-list__row" aria-current={phaseSel === p.n ? 'true' : undefined}
                onClick={() => { setPhaseSel(p.n); setTabFor('home', 'roadmap'); }}>
                <span className={`dm-phase-dot dm-phase-dot--${p.status}`} aria-hidden="true">{p.status === 'done' ? <Icon name="check" size={14} /> : p.n}</span>
                <span className="dm-list__text">
                  <span className="dm-list__name">{p.name}</span>
                  <span className="dm-list__meta">{phaseStatusText(p)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  }
  if (view === 'controls') {
    const fam = (code) => {
      const list = controls.filter((c) => code === 'ALL' || c.family === code);
      return { total: list.length, met: list.filter((c) => statusOf(c.id) === 'met').length };
    };
    const all = fam('ALL');
    return (
      <>
        <button type="button" className="dm-side__head dm-side__head--btn" aria-current={family === 'ALL' ? 'true' : undefined}
          onClick={() => { setFamily('ALL'); setOpenControl(null); }}>
          <span><span className="dm-side__title">All 110 controls</span><span className="dm-small">{all.met} met</span></span>
          <Icon name="chevron" size={16} />
        </button>
        <ul className="dm-list">
          {families.map((f) => {
            const s = fam(f.code);
            return (
              <li key={f.code}>
                <button type="button" className="dm-list__row" aria-current={family === f.code ? 'true' : undefined}
                  onClick={() => { setFamily(f.code); setOpenControl(null); }}>
                  <span className="dm-ring" style={{ '--p': `${(s.met / s.total) * 100}%` }} aria-hidden="true"><span>{f.code}</span></span>
                  <span className="dm-list__text">
                    <span className="dm-list__name">{f.name}</span>
                    <span className="dm-bar" aria-label={`${s.met} of ${s.total} met`}><span style={{ width: `${(s.met / s.total) * 100}%` }} /></span>
                  </span>
                  <span className="dm-list__count">{s.met}/{s.total}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </>
    );
  }
  if (view === 'activity') {
    return (
      <>
        <button type="button" className="dm-side__head dm-side__head--btn" aria-current={personSel === 'ALL' ? 'true' : undefined} onClick={() => setPersonSel('ALL')}>
          <span><span className="dm-side__title">Everyone</span><span className="dm-small">{client.activity.length} updates</span></span>
          <Icon name="chevron" size={16} />
        </button>
        <ul className="dm-list">
          {client.people.map((p) => (
            <li key={p.id}>
              <button type="button" className="dm-list__row" aria-current={personSel === p.id ? 'true' : undefined} onClick={() => setPersonSel(p.id)}>
                <Avatar id={p.id} />
                <span className="dm-list__text"><span className="dm-list__name">{p.name}</span><span className="dm-list__meta">{p.role} · {p.org}</span></span>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  }
  if (view === 'documents') {
    return (
      <>
        <div className="dm-side__head">
          <div className="dm-side__title">Deliverables</div>
          <div className="dm-small">{client.documents.length} documents</div>
        </div>
        <ul className="dm-list">
          {client.documents.map((d) => (
            <li key={d.id}>
              <button type="button" className="dm-list__row" aria-current={docSel === d.id ? 'true' : undefined} onClick={() => setDocSel(d.id)}>
                <span className="dm-doc-chip">{d.kind}</span>
                <span className="dm-list__text"><span className="dm-list__name">{d.name}</span><span className="dm-list__meta">{ver(d.version)} · {d.status}</span></span>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  }
  return (
    <div className="dm-side__head">
      <div className="dm-side__title">Demo settings</div>
      <div className="dm-small">Changes stay in this browser.</div>
    </div>
  );
}

function phaseStatusText(p) {
  if (p.status === 'done') return `Done ${fmtDate(p.end, { month: 'short', day: 'numeric' })}`;
  if (p.status === 'active') return 'In progress';
  if (p.status === 'started') return 'Started early';
  return `Starts ${fmtDate(p.start, { month: 'short', day: 'numeric' })}`;
}

/* ---------- Home ---------- */
function Home({ tab, r, base, phaseSel, setPhaseSel, go, showGaps, openInControls, openDoc, statusOf, whatIfCount }) {
  const active = client.phases.find((p) => p.status === 'active');
  const days = daysUntil(client.company.assessmentDate);
  if (tab === 'roadmap') {
    return (
      <div className="dm-pad">
        <h2 className="dm-h">Your roadmap</h2>
        <p className="dm-lede">Seven phases, from first call to staying certified. Pick one to see what it covers.</p>
        <ol className="dm-timeline">
          {client.phases.map((p) => (
            <li key={p.n} className={`dm-tl dm-tl--${p.status}${phaseSel === p.n ? ' is-sel' : ''}`}>
              <button type="button" onClick={() => setPhaseSel(p.n)} className="dm-tl__head">
                <span className={`dm-phase-dot dm-phase-dot--${p.status}`} aria-hidden="true">{p.status === 'done' ? <Icon name="check" size={14} /> : p.n}</span>
                <span><b>{p.name}</b><small>{fmtDate(p.start, { month: 'short', day: 'numeric' })} – {fmtDate(p.end, { month: 'short', day: 'numeric', year: 'numeric' })} · {phaseStatusText(p)}</small></span>
              </button>
              {phaseSel === p.n && (
                <div className="dm-tl__body">
                  <p>{p.summary}</p>
                  {p.deliverables?.length > 0 && (<><div className="dm-eyebrow">You get</div><ul>{p.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></>)}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (tab === 'team') {
    const orgs = ['Kestrel', 'Eagle Ridge', 'Brightline IT'];
    return (
      <div className="dm-pad">
        <h2 className="dm-h">Who is doing the work</h2>
        <p className="dm-lede">Every control has one owner. Here is who owns what.</p>
        {orgs.map((o) => (
          <div key={o} className="dm-team">
            <div className="dm-eyebrow">{o === 'Kestrel' ? 'Your team' : o}</div>
            <div className="dm-cards dm-cards--auto">
              {client.people.filter((p) => p.org === o).map((p) => {
                const owned = Object.keys(client.controls).filter((id) => client.controls[id].owner === p.id);
                const open = owned.filter((id) => statusOf(id) !== 'met').length;
                return (
                  <div key={p.id} className="dm-card dm-person">
                    <Avatar id={p.id} size={44} />
                    <div><b>{p.name}</b><div className="dm-small">{p.role}</div>
                      <div className="dm-small">{owned.length} controls · {open} open</div></div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
  // overview
  const nextBlock = r.blocking.map((id) => ({ id, ...client.controls[id] })).sort((a, b) => (a.due || '9').localeCompare(b.due || '9'))[0];
  const firstName = people[client.viewer].name.split(' ')[0];
  return (
    <div className="dm-pad">
      <h2 className="dm-h">Good morning, {firstName}.</h2>
      <p className="dm-lede">
        You are in phase {active?.n} of 7: <b>{active?.name}</b>. Your score has moved from {signed(client.baseline.sprs)} to {signed(r.score)} since the gap assessment{whatIfCount > 0 ? ', counting your what-if changes' : ''}.
      </p>

      <div className="dm-cards">
        <button type="button" className="dm-card dm-kpi" onClick={() => openDoc(client.documents.find((d) => d.kind === 'SPRS')?.id ?? client.documents[0].id)}>
          <div className="dm-eyebrow">SPRS score</div>
          <div className="dm-kpi__num">{signed(r.score)}</div>
          <div className="dm-small">{whatIfCount > 0 ? 'With what-ifs: ' : ''}{r.score >= client.baseline.sprs ? 'Up' : 'Down'} {Math.abs(r.score - client.baseline.sprs)} points since {fmtDate(client.baseline.date, { month: 'short', day: 'numeric' })}</div>
        </button>
        <button type="button" className="dm-card dm-kpi" onClick={showGaps}>
          <div className="dm-eyebrow">Controls met</div>
          <div className="dm-kpi__num">{r.counts.met}<small>/110</small></div>
          <div className="dm-small">{r.counts.partial + r.counts.not_met} still open</div>
        </button>
        <button type="button" className="dm-card dm-kpi" onClick={() => go('home', { tab: 'roadmap' })}>
          <div className="dm-eyebrow">Assessment day</div>
          <div className="dm-kpi__num">{days}<small> days</small></div>
          <div className="dm-small">{fmtDate(client.company.assessmentDate)}</div>
        </button>
      </div>

      <h3 className="dm-h3">Where you stand</h3>
      <p>
        To pass, a company needs a score of at least {CONDITIONAL_MIN}, and every open item must be small enough to fix after the assessment.
        {' '}You are at {signed(r.score)}. {r.blocking.length} item{r.blocking.length === 1 ? '' : 's'} must be fixed first;
        {' '}{r.poamable.length} can go on a 180-day fix-it plan (a POA&amp;M). Try changing a control's status on the <button type="button" className="dm-link" onClick={() => go('controls')}>Controls</button> page and watch the score move.
      </p>

      <div className="dm-cards dm-cards--2">
        <div className="dm-card">
          <div className="dm-eyebrow">About {client.company.shortName}</div>
          <p className="dm-small">{client.company.employees} people · {client.company.location} · {client.company.industry}</p>
          <p className="dm-small">{client.company.contract}</p>
        </div>
        <div className="dm-card">
          <div className="dm-eyebrow">Systems in scope</div>
          <ul className="dm-tags">{client.company.environment.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      </div>

      {nextBlock && (
        <div className="dm-card dm-action">
          <Avatar id={nextBlock.owner} size={44} />
          <div className="dm-action__text">
            <div className="dm-eyebrow">Most urgent</div>
            <b>{nextBlock.id} {byId[nextBlock.id].title}</b>
            <p className="dm-small">{nextBlock.note}{nextBlock.due ? ` Due ${fmtDate(nextBlock.due, { month: 'short', day: 'numeric' })}.` : ''}</p>
          </div>
          <button type="button" className="dm-btn" onClick={() => openInControls(nextBlock.id)}>Open control</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Controls ---------- */
function Controls({ tab, family, query, setQuery, searchRef, openControl, setOpenControl, statusOf, setWhatIf, overrides }) {
  const q = query.trim().toLowerCase();
  const list = controls.filter((c) => {
    if (family !== 'ALL' && c.family !== family) return false;
    if (q && !`${c.id} ${c.title} ${c.plain} ${familyName[c.family]}`.toLowerCase().includes(q)) return false;
    // The open control stays put while its status is being changed.
    if (c.id === openControl) return true;
    const st = statusOf(c.id);
    if (tab === 'gaps' && st === 'met') return false;
    if (tab === 'poam' && (st === 'met' || !poamAllowed(c, st))) return false;
    return true;
  });
  return (
    <div className="dm-pad">
      <h2 className="dm-h">{family === 'ALL' ? 'Controls' : familyName[family]}</h2>
      <p className="dm-lede">
        {tab === 'poam'
          ? 'These open items are small enough to fix after the assessment, on a 180-day plan.'
          : 'NIST SP 800-171 has 110 controls. Most are worth 1, 3, or 5 points. Open one and change its status to see the score move.'}
      </p>
      <div className="dm-search">
        <Icon name="search" size={18} />
        <input ref={searchRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search controls, e.g. “password” or 3.5.3" aria-label="Search controls" />
      </div>
      <ul className="dm-controls">
        {list.map((c) => {
          const st = statusOf(c.id);
          const info = client.controls[c.id];
          const open = openControl === c.id;
          return (
            <li key={c.id} id={`dm-c-${c.id}`} className={open ? 'is-open' : ''}>
              <button type="button" className="dm-ctl" aria-expanded={open} onClick={() => setOpenControl(open ? null : c.id)}>
                <span className={`dm-dot dm-dot--${st}`} aria-hidden="true" />
                <span className="dm-ctl__id">{c.id}</span>
                <span className="dm-ctl__title">{c.title}{overrides[c.id] ? <em className="dm-whatif-tag">what-if</em> : null}</span>
                <span className="dm-ctl__w" title={`Worth ${c.weight} points`}>{c.weight} pt</span>
                <StatusPill status={st} />
              </button>
              {open && (
                <div className="dm-ctl__body">
                  <p className="dm-ctl__plain">{c.plain}</p>
                  <dl className="dm-facts">
                    <div><dt>Where things stand</dt><dd>{info.note}</dd></div>
                    <div><dt>Owner</dt><dd className="dm-owner"><Avatar id={info.owner} size={24} /> {people[info.owner]?.name}</dd></div>
                    {info.due && st !== 'met' && <div><dt>Due</dt><dd>{fmtDate(info.due)}</dd></div>}
                    <div><dt>Evidence</dt><dd>{info.evidence?.length ? info.evidence.join(' · ') : 'None collected yet'}</dd></div>
                    <div><dt>Can it wait?</dt><dd>{st === 'met' ? 'Already met.' : poamAllowed(c, st) ? 'Yes. It can go on the 180-day fix-it plan.' : 'No. This must be fixed before the assessment.'}</dd></div>
                  </dl>
                  <fieldset className="dm-whatif">
                    <legend>What if this control were…</legend>
                    {STATUSES.filter((s) => s !== 'partial' || c.partialWeight != null || info.status === 'partial').map((s) => (
                      <label key={s} className={st === s ? 'is-on' : ''}>
                        <input type="radio" name={`wi-${c.id}`} checked={st === s} onChange={() => setWhatIf(c.id, s)} />
                        {STATUS_LABEL[s]}{s !== 'met' && <small> −{deduction(c, s)}</small>}{s === 'partial' && c.partialWeight == null && <small> (no partial credit)</small>}
                      </label>
                    ))}
                  </fieldset>
                </div>
              )}
            </li>
          );
        })}
        {list.length === 0 && <li className="dm-empty">No controls match. Try another word, or pick “All 110 controls”.</li>}
      </ul>
    </div>
  );
}

/* ---------- Activity ---------- */
function Activity({ tab, personSel, openInControls }) {
  const items = client.activity.filter((a) =>
    (personSel === 'ALL' || a.who === personSel) && (tab === 'all' || people[a.who]?.org === tab));
  return (
    <div className="dm-pad">
      <h2 className="dm-h">Activity</h2>
      <p className="dm-lede">Every change to your controls and documents, newest first.</p>
      <ol className="dm-feed">
        {items.map((a, i) => (
          <li key={i} className={i < 3 && personSel === 'ALL' && tab === 'all' ? 'is-new' : ''}>
            <Avatar id={a.who} />
            <div>
              <div><b>{people[a.who]?.name}</b> <span className="dm-small">· {fmtDate(a.date, { month: 'short', day: 'numeric' })}</span></div>
              <p>{a.text}</p>
              {a.control && byId[a.control] && (
                <button type="button" className="dm-chip" onClick={() => openInControls(a.control)}>{a.control} {byId[a.control].title}</button>
              )}
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="dm-empty">No updates here yet.</li>}
      </ol>
    </div>
  );
}

/* ---------- Documents ---------- */
function Documents({ tab, docSel, r }) {
  const d = client.documents.find((x) => x.id === docSel) ?? client.documents[0];
  if (!d) return null;
  if (tab === 'details') {
    return (
      <div className="dm-pad">
        <h2 className="dm-h">{d.name}</h2>
        <dl className="dm-facts dm-facts--wide">
          <div><dt>Type</dt><dd>{d.kind}</dd></div>
          <div><dt>Version</dt><dd>{ver(d.version)}</dd></div>
          <div><dt>Status</dt><dd>{d.status}</dd></div>
          <div><dt>Last updated</dt><dd>{fmtDate(d.updated)}</dd></div>
          <div><dt>What it is</dt><dd>{d.summary}</dd></div>
        </dl>
      </div>
    );
  }
  return (
    <div className="dm-pad">
      <article className="dm-paper">
        <div className="dm-paper__meta"><span className="dm-doc-chip">{d.kind}</span> {ver(d.version)} · {d.status} · {fmtDate(d.updated)}</div>
        <h2 className="dm-h">{d.name}</h2>
        <p className="dm-lede">{d.summary}</p>
        {d.kind === 'SPRS' && (
          <p className="dm-callout">Live score with your current statuses: <b>{signed(r.score)}</b> of {MAX_SCORE}.</p>
        )}
        {d.sections.map((s) => (
          <section key={s.heading}><h3 className="dm-h3">{s.heading}</h3><p>{s.body}</p></section>
        ))}
        <p className="dm-small dm-paper__foot">Preview only. Real deliverables are full documents, built to the CMMC assessment guide.</p>
      </article>
    </div>
  );
}

/* ---------- Settings ---------- */
function Settings({ whatIfCount, resetWhatIf, r, base }) {
  return (
    <div className="dm-pad">
      <h2 className="dm-h">About this demo</h2>
      <p className="dm-lede">This is the workspace our clients use, filled with a made-up company so you can click around safely.</p>
      <div className="dm-card">
        <div className="dm-eyebrow">What-if changes</div>
        <p>{whatIfCount === 0
          ? 'You have not changed any controls yet. Open one on the Controls page and pick a new status.'
          : `You changed ${whatIfCount} control${whatIfCount === 1 ? '' : 's'}. The score went from ${signed(base.score)} to ${signed(r.score)}.`}</p>
        <button type="button" className="dm-btn dm-btn--ghost" onClick={resetWhatIf} disabled={whatIfCount === 0}>Reset all changes</button>
      </div>
      <h3 className="dm-h3">How the score works</h3>
      <p>The Department of Defense scores each company from {WORST} to {MAX_SCORE}. You start at {MAX_SCORE} and lose up to 5 points for each control you have not met. The weights here come straight from the DoD Assessment Methodology.</p>
      <p>To pass with a short fix-it plan, you need {CONDITIONAL_MIN} or more, and every open item must be one the rules let you fix later. Big items, like multifactor sign-in, must be done before the assessment.</p>
      <h3 className="dm-h3">What is real and what is not</h3>
      <p>The 110 controls, their point values, and the pass rules are real. {client.company.name}, its people, and its IT provider are invented.</p>
    </div>
  );
}
