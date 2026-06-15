import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, type Locale } from '../i18n/index.ts';
import { sampleBusinesses } from '../data/sampleBusinesses.ts';
import { BusinessCard } from '../components/BusinessCard.tsx';
import './Discover.css';

export function Discover() {
  const { t, i18n } = useTranslation();
  const [greaterHouston, setGreaterHouston] = useState(false);

  function switchLocale(locale: Locale): void {
    void i18n.changeLanguage(locale);
    localStorage.setItem('locale', locale);
  }

  return (
    <div className="discover">
      <header className="discover__top">
        <div className="discover__loc">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
          <span>Near <b>Third Ward</b></span>
        </div>
        <div className="discover__lang" role="group" aria-label="Language">
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc}
              className={i18n.language === loc ? 'on' : ''}
              aria-pressed={i18n.language === loc}
              onClick={() => { switchLocale(loc); }}
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="discover__hero">
        <p className="discover__eyebrow">{t('discover.eyebrow')}</p>
        <h1 className="discover__marquee">Welcome to<span>The Table</span></h1>
        <p className="discover__tagline">{t('discover.tagline')}</p>
      </div>

      <div className="discover__search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 20l-5.6-5.6a7 7 0 1 0-1.4 1.4L20 21zM5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0z" /></svg>
        <input placeholder={t('discover.search')} aria-label={t('discover.search')} />
      </div>

      <div className="discover__chips" role="group" aria-label="Filters">
        <button className="chip on">{t('filters.all')}</button>
        <button className="chip">{t('filters.restaurants')}</button>
        <button className="chip">{t('filters.stores')}</button>
        <button className="chip">{t('filters.openNow')}</button>
        <button className="chip">{t('filters.verified')}</button>
        <button className="chip">{t('filters.welcome')}</button>
      </div>

      <div className="discover__geo">
        <div className="discover__geo-txt">
          <b>{t('discover.greaterHouston')}</b>
          <span>{t('discover.greaterHoustonSub')}</span>
        </div>
        <button
          className={`switch ${greaterHouston ? 'switch--on' : ''}`}
          role="switch"
          aria-checked={greaterHouston}
          aria-label={t('discover.greaterHouston')}
          onClick={() => { setGreaterHouston((v) => !v); }}
        />
      </div>

      <div className="discover__sec">
        <h2>{t('discover.nearYou')}</h2>
        <a href="#map">{t('discover.mapView')} →</a>
      </div>

      <div className="discover__list">
        {sampleBusinesses.map((b, i) => (
          <BusinessCard key={b.id} business={b} index={i} />
        ))}
      </div>
    </div>
  );
}
