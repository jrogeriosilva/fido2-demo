import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { I18N, detectLanguage } from './data/i18n';
import type { Actor, Ceremony, Language, Mode } from './data/types';
import { createCeremonies } from './data/ceremonies';
import { CeremonyScene } from './components/CeremonyScene';
import { EducationalContent } from './components/EducationalContent';
import { EcosystemNav } from './components/EcosystemNav';
import { AuthenticatorIcon } from './components/AuthenticatorIcon';
const positions: Record<Actor, number> = { rp: 12, client: 50, auth: 88 };
const authenticators = [
    ['usb', 'tabUsb', 'tabUsbSub'], ['nfc', 'tabNfc', 'tabNfcSub'],
    ['hello', 'tabHello', 'tabHelloSub'], ['phone', 'tabPhone', 'tabPhoneSub'],
] as const;
export default function App() {
    const [language, setLanguage] = useState<Language>(detectLanguage);
    const [ceremony, setCeremony] = useState<Ceremony>('usb');
    const [mode, setMode] = useState<Mode>('login');
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const T = I18N[language];
    const definition = useMemo(() => createCeremonies(T)[ceremony], [T, ceremony]);
    const steps = useMemo(() => definition.steps(mode), [definition, mode]);
    const step = steps[index];
    const M = T[ceremony];
    useEffect(() => {
        document.documentElement.lang = T.htmlLang;
        try {
            localStorage.setItem('fido2demo.lang', language);
        }
        catch { /* Storage is optional. */ }
    }, [language, T]);
    const go = useCallback((next: number) => {
        setPlaying(false);
        setIndex(Math.max(0, Math.min(steps.length - 1, next)));
    }, [steps.length]);
    const togglePlayback = useCallback(() => {
        if (index === steps.length - 1)
            setIndex(0);
        setPlaying(value => !value);
    }, [index, steps.length]);
    useEffect(() => {
        if (!playing)
            return;
        const timer = window.setTimeout(() => {
            setIndex(current => Math.min(current + 1, steps.length - 1));
            if (index >= steps.length - 2)
                setPlaying(false);
        }, step.dur ?? 2800);
        return () => window.clearTimeout(timer);
    }, [playing, index, step.dur, steps.length]);
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
                return;
            if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, [contenteditable="true"]'))
                return;
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                go(index + 1);
            }
            else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                go(index - 1);
            }
            else if (event.key === ' ') {
                event.preventDefault();
                togglePlayback();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [index, go, togglePlayback]);
    return <>
    <header className="suite-header"><div className="suite-header-inner">
      <a className="suite-brand" href="#top"><span className="suite-mark" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg></span><span className="suite-brand-copy"><span className="suite-title">FIDO2 Demo</span><span className="suite-subtitle">FIDO2 · WebAuthn</span></span></a>
      <div className="suite-actions">      <div className="lang">
        <svg className="globe" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13"/></svg>
        <div className="seg" role="group" aria-label={T.ariaLang}>
          {(['pt', 'en'] as const).map(lang => <button key={lang} aria-pressed={language === lang} lang={lang === 'pt' ? 'pt-BR' : 'en'} title={lang === 'pt' ? 'Português' : 'English'} onClick={() => { setPlaying(false); setLanguage(lang); }}>{lang.toUpperCase()}</button>)}
        </div>
      </div></div>
    </div></header>
    <div className="wrap" id="top">
    <title>{T.title}</title>
    <meta name="description" content={T.metaDesc}/>
    <EcosystemNav portuguese={language === 'pt'}/>
    <header>
      <div className="head-text">
        <h1>{T.h1}</h1>
        <p className="lede">{T.lede}</p>
      </div>

    </header>
    <div className="selector">
      <div className="tabs" role="group" aria-label={T.ariaAuth}>
        {authenticators.map(([id, title, subtitle]) => <button key={id} className="tab" aria-pressed={ceremony === id} onClick={() => { go(0); setCeremony(id); }}>
          <AuthenticatorIcon ceremony={id}/>
          <span><span>{T[title]}</span><span className="tab-sub">{T[subtitle]}</span></span>
        </button>)}
      </div>
      <div className="seg" role="group" aria-label={T.ariaMode}>
        {(['login', 'register'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => { go(0); setMode(value); }}>{value === 'login' ? T.modeLogin : T.modeRegister}</button>)}
      </div>
    </div>
    <main className="main">
      <section className="stage" aria-label={T.ariaStage}>
        <div className="rail">
          <div className="track"/>
          {(['rp', 'client', 'auth'] as const).map(actor => <div key={actor} className={`node ${step.who === actor ? 'on' : ''}`} style={{ left: `${positions[actor]}%` }}><i /><span>{actor === 'rp' ? T.nodeRp : actor === 'client' ? T.nodeClient : M.auth}</span></div>)}
          {step.pkt && <div key={`${ceremony}-${mode}-${language}-${index}`} className="pkt show" style={{ '--from': `${positions[step.pkt.from]}%`, '--to': `${positions[step.pkt.to]}%` } as CSSProperties}><span className="pkt-label">{step.pkt.label}</span></div>}
        </div>
        <div className="scene-box">
          <CeremonyScene ceremony={ceremony} T={T} mode={mode} step={step} states={definition.states[step.st] ?? []}/>
          <div className="note">{M.note}</div>
        </div>
        <div className="current-step" aria-live="polite" aria-atomic="true">
          <span>{index + 1} / {steps.length} · {T.tags[step.tag]}</span>
          <h2>{step.t}</h2><p>{step.d}</p>
        </div>
        <div className="controls">
          <button className="btn" onClick={() => go(0)}>{T.reset}</button>
          <button className="btn" disabled={index === 0} onClick={() => go(index - 1)}>{T.prev}</button>
          <button className="btn primary" onClick={togglePlayback}>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{playing ? <><rect x="3" y="2.5" width="3.5" height="11" rx="1"/><rect x="9.5" y="2.5" width="3.5" height="11" rx="1"/></> : <path d="M4 2.5v11l9-5.5z"/>}</svg>
            {playing ? T.pause : T.play}
          </button>
          <button className="btn" disabled={index === steps.length - 1} onClick={() => go(index + 1)}>{T.next}</button>
          <div className="progress" aria-hidden="true"><i style={{ transform: `scaleX(${(index + 1) / steps.length})` }}/></div>
          <span className="counter" role="status">{index + 1} / {steps.length}</span>
        </div>
      </section>
      <aside className="side">
        <section className="steps" aria-labelledby="steps-title">
          <h2 id="steps-title">{T.stepsTitle(mode, M.name)}</h2>
          <p className="h-sub">{T.stepsSub(steps.length)}</p>
          <ol className="list">{steps.map((item, i) => <li key={i} className={i === index ? 'active' : i < index ? 'done' : ''}>
            <button aria-current={i === index ? 'step' : undefined} onClick={() => go(i)}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <span><span className="t">{item.t}</span><span className="d">{item.d}<br /><span className={`tag ${item.tag}`}>{T.tags[item.tag]}</span></span></span>
            </button>
          </li>)}</ol>
        </section>
        <section className="data" aria-labelledby="data-title">
          <h3 id="data-title">{step.tag === 'rp' ? T.dataRp : step.tag === 'auth' ? T.dataAuth : T.dataTransit}</h3>
          <pre>{step.data}</pre>
        </section>
      </aside>
    </main>
    <EducationalContent T={T}/>
  </div></>;
}
