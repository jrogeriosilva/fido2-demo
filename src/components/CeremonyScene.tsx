import type { ReactNode } from 'react';
import type { Ceremony, Mode, Step } from '../data/types';
import type { Translations } from '../data/i18n';
function seeded(n: number) { let s = n >>> 0; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; }; }
function qrPattern() {
    const N = 21, g: boolean[][] = [], r = seeded(20260903);
    for (let y = 0; y < N; y++) {
        g[y] = [];
        for (let x = 0; x < N; x++)
            g[y][x] = r() < 0.45;
    }
    const finder = (ox: number, oy: number) => { for (let y = 0; y < 7; y++)
        for (let x = 0; x < 7; x++) {
            const edge = x === 0 || y === 0 || x === 6 || y === 6, core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
            g[oy + y][ox + x] = edge || core;
        } for (let i = -1; i < 8; i++) {
        if (g[oy + i] && g[oy + i][ox - 1] !== undefined && ox - 1 >= 0)
            g[oy + i][ox - 1] = false;
        if (g[oy + i] && ox + 7 < N)
            g[oy + i][ox + 7] = false;
        if (oy - 1 >= 0 && g[oy - 1][ox + i] !== undefined && ox + i >= 0 && ox + i < N)
            g[oy - 1][ox + i] = false;
        if (oy + 7 < N && ox + i >= 0 && ox + i < N)
            g[oy + 7][ox + i] = false;
    } };
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);
    return g;
}
const QR = qrPattern();
function Qr({ x, y, cell, className = 'qr' }: {
    x: number;
    y: number;
    cell: number;
    className?: string;
}) {
    return <g className={className} transform={`translate(${x},${y})`}>
    {QR.flatMap((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell}/> : null))}
  </g>;
}
interface Props {
    T: Translations;
    mode: Mode;
    step: Step;
}
function Laptop({ T, mode, step, dlgTitle, iconMarkup, extraScreen }: Props & {
    dlgTitle: string;
    iconMarkup: ReactNode;
    extraScreen?: ReactNode;
}) {
    return (<g className="laptop">
    <rect x="170" y="60" width="400" height="260" rx="14" className="laptop-screen"/>
    <rect x="170" y="60" width="400" height="260" rx="14" fill="none" stroke="var(--device-edge)" strokeWidth="2"/>
    <rect x="184" y="74" width="372" height="224" rx="6" className="screen-bg"/>
    <circle cx="370" cy="67" r="3" className="cam" fill="var(--muted)"/>
    <rect x="130" y="326" width="480" height="22" rx="6" className="laptop-base"/>
    <rect x="130" y="326" width="480" height="22" rx="6" fill="none" stroke="var(--device-edge)" strokeWidth="2"/>
    <rect x="330" y="330" width="80" height="6" rx="3" fill="var(--device-edge)" opacity=".6"/>
    <rect x="600" y="332" width="12" height="9" rx="1.5" fill="var(--device-edge)"/>
    {/* browser chrome */}
    <rect x="192" y="82" width="356" height="16" rx="8" className="chrome"/>
    <circle cx="203" cy="90" r="3" fill="var(--ok)"/>
    <text x="212" y="93.5" fontSize="8.5" className="mono s-muted">https://{T.domain}</text>
    {/* screens */}
    <g className="scr scr-login">
      <text x="370" y="150" fontSize="17" textAnchor="middle" className="disp s-ink">{T.domain}</text>
      <text x="370" y="170" fontSize="10" textAnchor="middle" className="s-muted">{T.scrHello}</text>
      <rect x="296" y="190" width="148" height="28" rx="6" className="s-flow"/>
      <text x="370" y="208" fontSize="10.5" textAnchor="middle" fill="#fff" fontWeight="500" className="login-btn">{mode === 'login' ? T.loginBtn : T.registerBtn}</text>
    </g>
    <g className="scr scr-loading">
      <text x="370" y="180" fontSize="11" textAnchor="middle" className="s-muted loading-msg">{T.loadingMsg}</text>
      <g className="dots" fill="var(--flow)"><circle cx="356" cy="200" r="3.5"/><circle cx="370" cy="200" r="3.5"/><circle cx="384" cy="200" r="3.5"/></g>
    </g>
    <g className="scr scr-dialog">
      <rect x="250" y="112" width="240" height="160" rx="10" className="dlg"/>
      <g transform="translate(352,126)">{iconMarkup}</g>
      <text x="370" y="192" fontSize="11.5" textAnchor="middle" fontWeight="600" className="s-ink">{dlgTitle}</text>
      <text x="370" y="212" fontSize="10" textAnchor="middle" className="s-muted dlg-msg">{step.screen.msg ?? "…"}</text>
      <g className="dots" fill="var(--flow)"><circle cx="356" cy="248" r="3"/><circle cx="370" cy="248" r="3"/><circle cx="384" cy="248" r="3"/></g>
    </g>
    {extraScreen}
    <g className="scr scr-ok">
      <circle cx="370" cy="170" r="30" className="ok-ring" strokeWidth="2.5"/>
      <path d="M355 171 l10 10 l20 -22" className="ok-check"/>
      <text x="370" y="228" fontSize="13" textAnchor="middle" className="disp s-ink ok-label">{mode === 'login' ? T.okLogin : T.okRegister}</text>
      <text x="370" y="246" fontSize="9.5" textAnchor="middle" className="s-muted">{T.okSub}</text>
    </g>
  </g>);
}
const ICON_KEY = (<g fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,4)"><rect x="2" y="12" width="9" height="10" rx="1"/><rect x="11" y="8" width="23" height="18" rx="4"/><circle cx="26" cy="17" r="2.5" fill="var(--accent)"/></g>);
const ICON_NFC = (<g fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2,4)"><rect x="2" y="12" width="9" height="10" rx="1"/><rect x="11" y="8" width="17" height="18" rx="4"/><path d="M31 12.5a6 6 0 0 1 0 9M35.5 8.5a11 11 0 0 1 0 17"/></g>);
const ICON_FACE = (<g className="face-icon" transform="translate(0,2)"><path d="M3 10V6a3 3 0 0 1 3-3h4M26 3h4a3 3 0 0 1 3 3v4M36 26v4a3 3 0 0 1-3 3h-4M10 33H6a3 3 0 0 1-3-3v-4"/><circle cx="13" cy="15" r="1.4" fill="var(--flow)"/><circle cx="23" cy="15" r="1.4" fill="var(--flow)"/><path d="M12 23c2 2.5 4.5 3.5 6 3.5s4-1 6-3.5"/></g>);
const ICON_PHONE = (<g fill="none" stroke="var(--flow)" strokeWidth="2.5" strokeLinecap="round" transform="translate(4,2)"><rect x="6" y="1" width="18" height="32" rx="4"/><path d="M12 28h6"/></g>);
function UsbScene({ T, mode, step, className }: Props & {
    className: string;
}) {
    return (<svg viewBox="0 0 800 400" className={className} data-screen={step.screen.type} role="img" aria-label={T.ariaUsb}>
    <Laptop T={T} mode={mode} step={step} dlgTitle={T.usb.dlg} iconMarkup={ICON_KEY}/>
    <g className="key">
      <rect x="0" y="0" width="22" height="14" rx="2" className="key-plug" strokeWidth="1.5"/>
      <rect x="5" y="4" width="12" height="2" fill="#7B828E"/><rect x="5" y="8" width="12" height="2" fill="#7B828E"/>
      <circle cx="40" cy="7" r="26" className="halo" fill="var(--ok)" opacity=".18"/>
      <rect x="22" y="-5" width="62" height="24" rx="7" className="key-body" strokeWidth="2"/>
      <circle cx="76" cy="7" r="4" className="key-ring"/>
      <circle cx="52" cy="7" r="5.5" className="led"/>
      <text x="53" y="40" fontSize="10" textAnchor="middle" className="mono key-lbl" fill="var(--ok)">{mode === 'login' ? T.keySigned : T.keyCreated}</text>
    </g>
    {/* presence check: hint ring while blinking, then the hand presses the sensor */}
    <circle cx="652" cy="336" r="10" className="tap-ring"/>
    <text x="653" y="369" fontSize="10" textAnchor="middle" className="mono key-hint" fill="var(--accent)">{T.keyHint}</text>
    <ellipse cx="655" cy="339" rx="14" ry="9" className="tap-shadow"/>
    <g className="finger">
      <g className="press">
        {/* local coords: fingertip pad at (0,-12); rotated so the arm enters from the right */}
        <g className="hand" transform="translate(643.5,344.5) rotate(45)">
          <ellipse cx="-24" cy="-152" rx="13" ry="24" transform="rotate(-28 -24 -152)"/>
          <path d="M-17 -130 L-15 -15 a15 15 0 0 0 30 0 L17 -62
                   c0 20 30 20 30 0 c0 18 28 14 28 -6 c0 16 24 10 24 -12
                   c6 -18 8 -40 6 -60 c-2 -20 -4 -40 -2 -70 L14 -250
                   c-14 30 -22 60 -31 120 z"/>
          <path className="shade" d="M14 -62 c0 20 30 20 30 0 c-4 12 -26 12 -30 0z M45 -68 c0 18 28 14 28 -6 c-4 12 -24 12 -28 6z M74 -80 c0 16 24 10 24 -12 c-4 12 -20 12 -24 12z"/>
          <path className="crease" d="M-10 -52 q10 4 20 0 M-11 -92 q11 4 22 0"/>
          <ellipse className="nail" cx="0" cy="-14" rx="7.5" ry="10"/>
        </g>
      </g>
    </g>
    <circle cx="652" cy="336" r="10" className="ripple"/>
    <circle cx="652" cy="336" r="10" className="ripple"/>
    <text x="653" y="369" fontSize="10" textAnchor="middle" className="mono tap-lbl" fill="var(--ok)">{T.tapConfirmed}</text>
  </svg>);
}
function NfcScene({ T, mode, step, className }: Props & {
    className: string;
}) {
    return (<svg viewBox="0 0 800 400" className={className} data-screen={step.screen.type} role="img" aria-label={T.ariaNfc}>
    <Laptop T={T} mode={mode} step={step} dlgTitle={T.nfc.dlg} iconMarkup={ICON_NFC}/>
    {/* contactless reader plugged into the laptop's USB port */}
    <path d="M612 336 H640" className="cable"/>
    <g className="reader">
      <rect x="640" y="316" width="130" height="32" rx="7" className="pad-body" strokeWidth="2"/>
      <rect x="647" y="321" width="116" height="13" rx="4" className="pad-top"/>
      <g className="pad-cl" transform="translate(659,327.5)"><path d="M0 -1.2 a1.2 1.2 0 0 1 0 2.4"/><path d="M3.5 -3.5 a4.5 4.5 0 0 1 0 7"/><path d="M7 -6.5 a8.5 8.5 0 0 1 0 13"/></g>
      <text x="743" y="330.5" fontSize="7.5" textAnchor="middle" className="mono" fill="var(--muted)" fontWeight="500" letterSpacing=".1em">NFC</text>
      <circle cx="758" cy="341" r="2.5" className="pad-led"/>
    </g>
    {/* 13.56 MHz field radiating from the pad */}
    <g className="waves">
      <path d="M698.1 316 a8 8 0 0 1 13.8 0"/>
      <path d="M691.1 312 a16 16 0 0 1 27.8 0"/>
      <path d="M684.2 308 a24 24 0 0 1 41.6 0"/>
    </g>
    <circle cx="705" cy="327" r="10" className="pad-ring"/>
    <text x="692" y="369" fontSize="10" textAnchor="middle" className="mono pad-hint" fill="var(--accent)">{T.nfcHint}</text>
    <text x="692" y="369" fontSize="10" textAnchor="middle" className="mono up-lbl" fill="var(--ok)">{T.nfcUp}</text>
    <text x="692" y="369" fontSize="10" textAnchor="middle" className="mono hold-lbl" fill="var(--accent)">{T.nfcHold}</text>
    {/* the key floats a couple of centimetres above the pad */}
    <g className="key"><g className="key-bob">
      <rect x="0" y="0" width="22" height="14" rx="2" className="key-plug" strokeWidth="1.5"/>
      <rect x="5" y="4" width="12" height="2" fill="#7B828E"/><rect x="5" y="8" width="12" height="2" fill="#7B828E"/>
      <circle cx="53" cy="7" r="26" className="halo" fill="var(--ok)" opacity=".18"/>
      <rect x="22" y="-5" width="62" height="24" rx="7" className="key-body" strokeWidth="2"/>
      <g className="key-cl" transform="translate(33,7)"><path d="M0 -2.5 a3.2 3.2 0 0 1 0 5"/><path d="M3.5 -5.5 a7 7 0 0 1 0 11"/></g>
      <circle cx="76" cy="7" r="4" className="key-ring"/>
      <circle cx="56" cy="7" r="5.5" className="led"/>
      <text x="53" y="-30" fontSize="10" textAnchor="middle" className="mono key-lbl" fill="var(--ok)">{mode === 'login' ? T.keySigned : T.keyCreated}</text>
    </g></g>
  </svg>);
}
function HelloScene({ T, mode, step, className }: Props & {
    className: string;
}) {
    return (<svg viewBox="0 0 800 400" className={className} data-screen={step.screen.type} role="img" aria-label={T.ariaHello}>
    <polygon points="370,67 668,140 668,240" className="beam"/>
    <Laptop T={T} mode={mode} step={step} dlgTitle={T.hello.dlg} iconMarkup={ICON_FACE}/>
    <g className="tpm-g">
      <rect x="290" y="330" width="36" height="14" rx="2" className="tpm"/>
      <rect x="283" y="323" width="50" height="28" rx="4" className="tpm-ring"/>
      <text x="308" y="340" fontSize="7" textAnchor="middle" className="mono" fill="var(--panel)" fontWeight="500">TPM</text>
      <g className="tpm-lbl">
        <path d="M308 351 v22" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3"/>
        <text x="308" y="388" fontSize="10.5" textAnchor="middle" className="mono" fill="var(--accent)">{T.tpmLbl}</text>
      </g>
    </g>
    <g className="person" transform="translate(700,192)">
      <path d="M-52 92 Q-52 42 0 42 Q52 42 52 92" className="face"/>
      <circle cx="0" cy="0" r="34" className="face"/>
      <g className="facepts">
        <circle cx="-12" cy="-6" r="2"/><circle cx="12" cy="-6" r="2"/><circle cx="0" cy="6" r="2"/><circle cx="-10" cy="16" r="2"/><circle cx="10" cy="16" r="2"/>
        <circle cx="-22" cy="4" r="1.5"/><circle cx="22" cy="4" r="1.5"/><circle cx="0" cy="-20" r="1.5"/>
      </g>
      <line x1="-40" y1="0" x2="40" y2="0" className="scanline"/>
    </g>
  </svg>);
}
function PhoneScene({ T, mode, step, className }: Props & {
    className: string;
}) {
    return (<svg viewBox="0 0 800 400" className={className} data-screen={step.screen.type} data-phone={step.phone ?? 'off'} role="img" aria-label={T.ariaPhone}>
    <g className="tunnel">
      <path d="M380 58 C 440 -6 690 -6 740 116"/>
      <path d="M548 8 a12 12 0 0 1 22 -6 a10 10 0 0 1 18 8 a9 9 0 0 1 -2 18 h-40 a10 10 0 0 1 2 -20 z" className="cloud"/>
      <text x="560" y="44" fontSize="10" textAnchor="middle" className="mono" fill="var(--flow)">{T.tunnelLbl}</text>
    </g>
    <Laptop T={T} mode={mode} step={step} dlgTitle={T.phone.dlg} iconMarkup={ICON_PHONE} extraScreen={<>
    <g className="scr scr-qr">
      <text x="370" y="122" fontSize="11.5" textAnchor="middle" fontWeight="600" className="s-ink">{T.qrTitle}</text>
      <rect x="322" y="130" width="96" height="96" rx="6" fill="#fff" stroke="var(--line)"/>
      <Qr x={328} y={136} cell={4}/>
      <text x="370" y="246" fontSize="9.5" textAnchor="middle" className="s-muted">{T.qrHint}</text>
    </g></>}/>
    <g className="ble">
      <path d="M676 214 a44 44 0 0 0 0 72"/>
      <path d="M660 200 a62 62 0 0 0 0 100"/>
      <path d="M644 186 a80 80 0 0 0 0 128"/>
    </g>
    <text x="646" y="352" fontSize="10" textAnchor="middle" className="mono ble-lbl" fill="var(--flow)">{T.bleLbl}</text>
    <g className="phone">
      <rect x="0" y="0" width="100" height="200" rx="16" className="ph-body" strokeWidth="2"/>
      <rect x="6" y="8" width="88" height="184" rx="10" className="ph-screen"/>
      <circle cx="50" cy="16" r="3" fill="var(--device-edge)"/>
      <rect x="-4" y="-4" width="108" height="208" rx="19" className="ph-halo"/>
      <g className="ph-scr ph-camera">
        <rect x="6" y="8" width="88" height="184" rx="10" fill="var(--device-edge)"/>
        <g transform="translate(23,56)" style={{ opacity: .9 }}><Qr x={0} y={0} cell={2.6} className="qr-mini"/></g>
        <path d="M18 50 v-8 h8 M74 42 h8 v8 M82 110 v8 h-8 M26 118 h-8 v-8" className="vf"/>
        <text x="50" y="150" fontSize="7.5" textAnchor="middle" fill="#fff" opacity=".85">{T.phCode}</text>
        <circle cx="50" cy="172" r="8" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".7"/>
      </g>
      <g className="ph-scr ph-prompt">
        <text x="50" y="44" fontSize="8.5" textAnchor="middle" fontWeight="600" className="s-ink">{T.domain}</text>
        <text x="50" y="58" fontSize="7" textAnchor="middle" className="s-muted">{T.phLoginAs}</text>
        <g className="fp" transform="translate(30,80)">
          <path d="M6 22c0-9 6-15 14-15s14 6 14 15"/>
          <path d="M11 27c0-6 4-11 9-11s9 5 9 11v5"/>
          <path d="M16 31c0-4 1.5-7 4-7s4 3 4 7v7"/>
          <path d="M20 29v11"/>
        </g>
        <text x="50" y="140" fontSize="7" textAnchor="middle" className="s-muted">{T.phTouch}</text>
        <rect x="18" y="160" width="64" height="16" rx="4" className="s-flow"/>
        <text x="50" y="171" fontSize="7" textAnchor="middle" fill="#fff">{T.phContinue}</text>
      </g>
      <g className="ph-scr ph-ok">
        <circle cx="50" cy="86" r="20" className="ok-ring" strokeWidth="2"/>
        <path d="M40 87 l7 7 l14 -15" fill="none" stroke="var(--ok)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="50" y="126" fontSize="8.5" textAnchor="middle" fontWeight="600" className="s-ink">{T.phSigned}</text>
        <text x="50" y="140" fontSize="6.5" textAnchor="middle" className="s-muted">{T.phSignedSub}</text>
      </g>
    </g>
  </svg>);
}
const scenes = { usb: UsbScene, nfc: NfcScene, hello: HelloScene, phone: PhoneScene };
export function CeremonyScene({ ceremony, states, ...props }: Props & {
    ceremony: Ceremony;
    states: string[];
}) {
    const Scene = scenes[ceremony];
    return <Scene {...props} className={['scene', ceremony, ...states].join(' ')}/>;
}
