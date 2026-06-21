import { useTranslation } from 'react-i18next';
import type { VerificationLevel } from '../types/business.ts';
import './badges.css';

export function VerificationBadge({ level }: { level: VerificationLevel }) {
  const { t } = useTranslation();
  if (level === 'verified') {
    return (
      <span className="badge badge--verified">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z" /></svg>
        {t('badge.verified')}
      </span>
    );
  }
  if (level === 'community') {
    return (
      <span className="badge badge--community">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6z" /></svg>
        {t('badge.community')}
      </span>
    );
  }
  return null; // candidates are never shown publicly
}

export function WelcomeBadge() {
  const { t } = useTranslation();
  return <span className="badge badge--welcome">♥ {t('badge.welcome')}</span>;
}

export function BuzzingBadge() {
  const { t } = useTranslation();
  return <span className="badge badge--buzzing">🔥 {t('badge.buzzing')}</span>;
}

export function BlackOwnedBadge() {
  const { t } = useTranslation();
  return (
    <span className="badge badge--blackowned">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 13.2a7.2 7.2 0 0 1-5-2c.1-1.6 3.3-2.5 5-2.5s4.9.9 5 2.5a7.2 7.2 0 0 1-5 2z" /></svg>
      {t('badge.blackOwned')}
    </span>
  );
}
