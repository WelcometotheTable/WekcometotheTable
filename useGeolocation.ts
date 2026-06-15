import type { Business } from '../types/business.ts';
import { VerificationBadge, WelcomeBadge, BuzzingBadge } from './badges.tsx';
import './BusinessCard.css';

const THUMB_TINTS = ['thumb--1', 'thumb--2', 'thumb--3', 'thumb--4'] as const;

export function BusinessCard({ business, index }: { business: Business; index: number }) {
  const tint = THUMB_TINTS[index % THUMB_TINTS.length];
  return (
    <article className="card">
      <div className={`card__thumb ${tint ?? ''}`} aria-hidden="true" />
      <div className="card__body">
        <div className="card__row1">
          <h3 className="card__name">{business.name}</h3>
          {business.distanceMiles !== null && (
            <span className="card__dist">{business.distanceMiles.toFixed(1)} mi</span>
          )}
        </div>
        <div className="card__tags">
          {business.subtype.map((s) => (
            <span key={s} className="card__tag">{s}</span>
          ))}
        </div>
        <div className="card__badges">
          <VerificationBadge level={business.verificationStatus} />
          {business.buzzing && <BuzzingBadge />}
          {business.welcomeBadge && <WelcomeBadge />}
        </div>
      </div>
    </article>
  );
}
