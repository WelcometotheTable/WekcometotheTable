.badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 3px 8px; border-radius: var(--radius-pill);
  text-transform: uppercase; letter-spacing: 0.03em;
}
.badge svg { width: 11px; height: 11px; }
.badge--verified { background: rgba(31,166,122,.16); color: var(--jade); }
.badge--verified svg { fill: var(--jade); }
.badge--community { background: rgba(242,161,4,.15); color: var(--gold); }
.badge--community svg { fill: var(--gold); }
.badge--buzzing { background: rgba(255,94,91,.16); color: var(--coral); }
.badge--welcome { background: rgba(31,166,122,.14); color: var(--jade); border: 1px solid rgba(31,166,122,.30); }
