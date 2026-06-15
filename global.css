import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Discover } from './routes/Discover.tsx';
import { Faq } from './routes/Faq.tsx';
import './App.css';

function Placeholder({ title }: { title: string }) {
  return <div className="placeholder">{title}</div>;
}

function BottomNav() {
  const { t } = useTranslation();
  const items = [
    { to: '/', label: t('nav.discover'), end: true },
    { to: '/map', label: t('nav.map'), end: false },
    { to: '/districts', label: t('nav.districts'), end: false },
    { to: '/saved', label: t('nav.saved'), end: false },
    { to: '/profile', label: t('nav.profile'), end: false },
  ];
  return (
    <nav className="bottomnav" aria-label="Primary">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => (isActive ? 'on' : '')}>
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function App() {
  const { t } = useTranslation();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/map" element={<Placeholder title={t('nav.map')} />} />
        <Route path="/districts" element={<Placeholder title={t('discover.districts')} />} />
        <Route path="/saved" element={<Placeholder title={t('nav.saved')} />} />
        <Route path="/profile" element={<Placeholder title={t('nav.profile')} />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}
