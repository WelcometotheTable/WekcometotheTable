.placeholder { max-width: 480px; margin: 0 auto; padding: 80px 20px; text-align: center; font-family: var(--font-display); font-size: 22px; color: var(--bone-dim); }

.bottomnav {
  position: fixed; left: 0; right: 0; bottom: 0; height: 78px;
  max-width: 480px; margin: 0 auto;
  background: rgba(14,7,18,.92); backdrop-filter: blur(14px);
  border-top: 1px solid var(--line);
  display: flex; justify-content: space-around; align-items: center;
  padding-bottom: env(safe-area-inset-bottom, 14px);
}
.bottomnav a { color: var(--bone-dim); font-size: 10px; font-family: var(--font-mono); padding: 8px; }
.bottomnav a.on { color: var(--gold); }
