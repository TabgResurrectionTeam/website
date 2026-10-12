<script lang="ts">
  import { createClickToEnterScene, type ClickToEnterScene } from './clickToEnterWebGl'

  interface Props {
    onenter: () => void
  }

  let { onenter }: Props = $props()

  let canvasElement: HTMLCanvasElement | null = $state(null)
  let labelElement: HTMLElement | null = $state(null)
  let scene: ClickToEnterScene | null = null
  let targetPointerX = 0
  let targetPointerY = 0

  $effect(() => {
    const canvas = canvasElement
    if (canvas === null) {
      return
    }

    try {
      scene = createClickToEnterScene(canvas)
    } catch {
      return
    }

    return () => {
      scene?.dispose()
      scene = null
    }
  })

  $effect(() => {
    const label = labelElement
    if (label === null) {
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) {
      return
    }

    let smoothedPointerX = 0
    let smoothedPointerY = 0
    let animationFrameId = 0

    function step(): void {
      smoothedPointerX += (targetPointerX - smoothedPointerX) * 0.16
      smoothedPointerY += (targetPointerY - smoothedPointerY) * 0.16
      label.style.setProperty('--pointer-x', smoothedPointerX.toFixed(4))
      label.style.setProperty('--pointer-y', smoothedPointerY.toFixed(4))
      animationFrameId = requestAnimationFrame(step)
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  })

  function handlePointerMove(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const normalizedX = (event.clientX - rect.left) / rect.width
    const normalizedY = (event.clientY - rect.top) / rect.height
    targetPointerX = normalizedX * 2 - 1
    targetPointerY = normalizedY * 2 - 1
    scene?.setPointer(normalizedX, 1 - normalizedY)
  }

  function handlePointerLeave(): void {
    targetPointerX = 0
    targetPointerY = 0
    scene?.setPointer(0.5, 0.5)
  }

</script>

<div
  class="gate"
  role="presentation"
  onpointermove={handlePointerMove}
  onpointerleave={handlePointerLeave}
>
  <canvas class="gate__canvas" bind:this={canvasElement} aria-hidden="true"></canvas>

  <div class="gate__vignette" aria-hidden="true"></div>
  <div class="gate__scanlines" aria-hidden="true"></div>
  <div class="gate__beam" aria-hidden="true"></div>
  <div class="gate__chroma" aria-hidden="true"></div>
  <div class="gate__noise" aria-hidden="true"></div>
  <div class="gate__corners" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>

  <button
    type="button"
    class="gate__button"
    onclick={onenter}
  >
    <span class="gate__halo" aria-hidden="true"></span>
    <span class="gate__ring gate__ring--dash" aria-hidden="true"></span>
    <span class="gate__ring gate__ring--outer" aria-hidden="true"></span>
    <span class="gate__ring gate__ring--spin" aria-hidden="true"></span>
    <span class="gate__ring gate__ring--inner" aria-hidden="true"></span>
    <span class="gate__orbit" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </span>
    <span class="gate__orbit gate__orbit--reverse" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
    <span class="gate__label" bind:this={labelElement}>
      <span class="gate__label-main" data-text="CLICK TO ENTER">CLICK TO ENTER</span>
      <span class="gate__underline" aria-hidden="true"></span>
      <span class="gate__label-sub">initiate sequence</span>
    </span>
  </button>
</div>

<style>
  .gate {
    position: fixed;
    inset: 0;
    z-index: 1000;
    overflow: hidden;
    background: #000;
    cursor: crosshair;
  }

  .gate__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .gate__vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 90% 80% at 50% 50%,
      transparent 28%,
      rgba(40, 0, 70, 0.25) 70%,
      rgba(0, 0, 0, 0.55) 100%
    );
  }

  .gate__scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 2px,
      rgba(0, 0, 0, 0.22) 3px
    );
    opacity: 0.45;
    mix-blend-mode: multiply;
  }

  .gate__beam {
    position: absolute;
    left: 0;
    right: 0;
    height: 22%;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(0, 255, 255, 0.16),
      rgba(255, 60, 200, 0.08),
      transparent
    );
    mix-blend-mode: screen;
    animation: scan-sweep 2.4s linear infinite;
  }

  .gate__chroma {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: screen;
    background:
      linear-gradient(90deg, rgba(255, 0, 140, 0.16), transparent 22%, transparent 78%, rgba(0, 255, 255, 0.16)),
      radial-gradient(circle at 50% 50%, rgba(120, 0, 255, 0.12), transparent 55%);
    animation: chroma-pulse 1.4s ease-in-out infinite;
  }

  .gate__corners {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
  }

  .gate__corners span {
    position: absolute;
    width: min(9vmin, 72px);
    height: min(9vmin, 72px);
    border: 2px solid rgba(0, 245, 255, 0.85);
    filter: drop-shadow(0 0 8px rgba(0, 230, 255, 0.95)) drop-shadow(0 0 16px rgba(255, 40, 190, 0.55));
    animation: corner-glow 1.3s ease-in-out infinite;
  }

  .gate__corners span:nth-child(1) {
    top: 3.5vmin;
    left: 3.5vmin;
    border-right: none;
    border-bottom: none;
  }

  .gate__corners span:nth-child(2) {
    top: 3.5vmin;
    right: 3.5vmin;
    border-left: none;
    border-bottom: none;
    animation-delay: 0.35s;
  }

  .gate__corners span:nth-child(3) {
    bottom: 3.5vmin;
    left: 3.5vmin;
    border-right: none;
    border-top: none;
    animation-delay: 0.7s;
  }

  .gate__corners span:nth-child(4) {
    bottom: 3.5vmin;
    right: 3.5vmin;
    border-left: none;
    border-top: none;
    animation-delay: 1.05s;
  }

  .gate__noise {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.12;
    mix-blend-mode: screen;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    animation: grain 0.28s steps(2) infinite;
  }

  @keyframes grain {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(-2%, 3%);
    }
  }

  .gate__button {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    z-index: 2;
  }

  .gate__halo {
    position: absolute;
    width: min(46vmin, 320px);
    height: min(46vmin, 320px);
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(
      circle,
      rgba(0, 240, 255, 0.28) 0%,
      rgba(180, 0, 255, 0.18) 38%,
      transparent 72%
    );
    filter: blur(12px);
    mix-blend-mode: screen;
    animation: halo-breathe 1.15s ease-in-out infinite;
  }

  .gate__ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(120, 240, 255, 0.55);
    pointer-events: none;
    animation: ring-pulse 2.2s ease-in-out infinite;
  }

  .gate__ring--dash {
    width: min(88vmin, 680px);
    height: min(88vmin, 680px);
    border: 2px dashed rgba(255, 70, 210, 0.7);
    box-shadow:
      0 0 24px rgba(255, 40, 180, 0.35),
      inset 0 0 30px rgba(0, 220, 255, 0.12);
    animation: spin 14s linear infinite;
  }

  .gate__ring--outer {
    width: min(72vmin, 520px);
    height: min(72vmin, 520px);
    border-width: 2px;
    border-color: rgba(0, 245, 255, 0.75);
    box-shadow:
      0 0 28px rgba(0, 220, 255, 0.65),
      0 0 70px rgba(0, 180, 255, 0.35),
      inset 0 0 50px rgba(180, 0, 255, 0.25);
  }

  .gate__ring--spin {
    width: min(60vmin, 430px);
    height: min(60vmin, 430px);
    border: none;
    background: conic-gradient(
      from 0deg,
      transparent 0deg 250deg,
      rgba(0, 245, 255, 0.15) 280deg,
      rgba(0, 245, 255, 1) 320deg,
      rgba(255, 50, 200, 1) 350deg,
      rgba(255, 255, 255, 1) 360deg
    );
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 2px));
    mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 2px));
    filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.95)) drop-shadow(0 0 18px rgba(255, 40, 190, 0.8));
    animation: spin 2.8s linear infinite;
  }

  .gate__ring--inner {
    width: min(42vmin, 300px);
    height: min(42vmin, 300px);
    border-width: 2px;
    border-color: rgba(255, 70, 210, 0.9);
    box-shadow:
      0 0 22px rgba(255, 40, 180, 0.7),
      inset 0 0 28px rgba(0, 220, 255, 0.25);
    animation-direction: reverse;
    animation-duration: 1.5s;
  }

  .gate__orbit {
    position: absolute;
    width: min(66vmin, 470px);
    height: min(66vmin, 470px);
    pointer-events: none;
    animation: spin 5.5s linear infinite;
  }

  .gate__orbit span {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fff;
    box-shadow:
      0 0 8px #fff,
      0 0 16px #00f0ff,
      0 0 28px #ff3cc8;
  }

  .gate__orbit span:nth-child(1) {
    top: -4px;
    left: calc(50% - 4px);
  }

  .gate__orbit span:nth-child(2) {
    bottom: 8%;
    left: 2%;
    background: #ff4fd8;
  }

  .gate__orbit span:nth-child(3) {
    top: 18%;
    right: -2px;
    width: 5px;
    height: 5px;
  }

  .gate__orbit span:nth-child(4) {
    bottom: -2px;
    right: 24%;
    background: #7af6ff;
  }

  .gate__orbit--reverse {
    width: min(34vmin, 230px);
    height: min(34vmin, 230px);
    animation-duration: 3.2s;
    animation-direction: reverse;
  }

  .gate__orbit--reverse span {
    width: 5px;
    height: 5px;
    background: #ff4fd8;
    box-shadow:
      0 0 8px #ff4fd8,
      0 0 18px #00f0ff;
  }

  .gate__orbit--reverse span:nth-child(1) {
    top: -3px;
    left: calc(50% - 2px);
  }

  .gate__orbit--reverse span:nth-child(2) {
    bottom: 6%;
    left: 0;
  }

  .gate__orbit--reverse span:nth-child(3) {
    top: 40%;
    right: -2px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes ring-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.75;
    }
    50% {
      transform: scale(1.07);
      opacity: 1;
    }
  }

  @keyframes halo-breathe {
    0%,
    100% {
      transform: scale(0.92);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.12);
      opacity: 1;
    }
  }

  @keyframes scan-sweep {
    0% {
      top: -24%;
    }
    100% {
      top: 108%;
    }
  }

  @keyframes chroma-pulse {
    0%,
    100% {
      opacity: 0.45;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes corner-glow {
    0%,
    100% {
      opacity: 0.55;
      filter: drop-shadow(0 0 4px rgba(0, 230, 255, 0.6));
    }
    50% {
      opacity: 1;
      filter: drop-shadow(0 0 12px rgba(0, 245, 255, 1)) drop-shadow(0 0 20px rgba(255, 40, 190, 0.8));
    }
  }

  .gate__label {
    --pointer-x: 0;
    --pointer-y: 0;
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.15rem 1.8rem 1rem;
    text-align: center;
    pointer-events: none;
    background: radial-gradient(ellipse at center, rgba(0, 0, 8, 0.72) 0%, rgba(0, 0, 8, 0.28) 62%, transparent 78%);
    transform:
      perspective(680px)
      translate3d(calc(var(--pointer-x) * 46px), calc(var(--pointer-y) * 28px), 0)
      rotateX(calc(var(--pointer-y) * 16deg))
      rotateY(calc(var(--pointer-x) * -22deg))
      rotateZ(calc(var(--pointer-x) * -6deg));
    transform-origin: center center;
    transform-style: preserve-3d;
  }

  .gate__label-main {
    position: relative;
    font-family: ui-monospace, 'Cascadia Code', 'Segoe UI Mono', monospace;
    font-size: clamp(0.95rem, 3.8vw, 1.7rem);
    font-weight: 700;
    letter-spacing: 0.48em;
    text-indent: 0.48em;
    color: transparent;
    background: linear-gradient(100deg, #ffffff 0%, #7af6ff 25%, #ff4fd8 50%, #fff 75%, #7af6ff 100%);
    background-size: 220% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    filter:
      drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))
      drop-shadow(0 0 14px rgba(0, 230, 255, 1))
      drop-shadow(0 0 28px rgba(255, 40, 180, 0.85));
    animation: label-flicker 1.8s linear infinite, shimmer 1.6s linear infinite;
  }

  .gate__label-main::before,
  .gate__label-main::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    opacity: 0.75;
  }

  .gate__label-main::before {
    color: #ff4fd8;
    clip-path: inset(0 0 55% 0);
    transform: translate(-2px, 0);
    animation: glitch-a 2.5s infinite linear alternate-reverse;
  }

  .gate__label-main::after {
    color: #4dfff0;
    clip-path: inset(45% 0 0 0);
    transform: translate(2px, 0);
    animation: glitch-b 3s infinite linear alternate-reverse;
  }

  @keyframes glitch-a {
    0%,
    72%,
    100% {
      transform: translate(-2px, 0);
      opacity: 0.8;
    }
    74% {
      transform: translate(7px, -2px);
      opacity: 1;
    }
    76% {
      transform: translate(-9px, 2px);
    }
    78% {
      transform: translate(4px, -1px);
      clip-path: inset(10% 0 55% 0);
    }
    82% {
      transform: translate(-2px, 0);
      clip-path: inset(0 0 55% 0);
    }
  }

  @keyframes glitch-b {
    0%,
    68%,
    100% {
      transform: translate(2px, 0);
      opacity: 0.8;
    }
    70% {
      transform: translate(-8px, 2px);
      opacity: 1;
    }
    73% {
      transform: translate(6px, -2px);
    }
    76% {
      transform: translate(-3px, 1px);
      clip-path: inset(40% 0 5% 0);
    }
    80% {
      transform: translate(2px, 0);
      clip-path: inset(45% 0 0 0);
    }
  }

  @keyframes label-flicker {
    0%,
    17%,
    19%,
    58%,
    61%,
    100% {
      opacity: 1;
    }
    18% {
      opacity: 0.35;
    }
    59% {
      opacity: 0.55;
    }
    60% {
      opacity: 1;
      filter:
        drop-shadow(4px 0 0 rgba(255, 40, 180, 0.9))
        drop-shadow(-4px 0 0 rgba(0, 245, 255, 0.9));
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 220% 50%;
    }
  }

  .gate__underline {
    width: min(78%, 280px);
    height: 2px;
    background: linear-gradient(90deg, transparent, #00f6ff, #fff, #ff4fd8, #00f6ff, transparent);
    background-size: 200% 100%;
    box-shadow:
      0 0 8px #00f0ff,
      0 0 18px #ff3cc8;
    animation: shimmer 0.9s linear infinite;
  }

  .gate__label-sub {
    font-family: system-ui, sans-serif;
    font-size: clamp(0.68rem, 2.1vw, 0.85rem);
    letter-spacing: 0.42em;
    text-indent: 0.42em;
    text-transform: uppercase;
    color: #d7f7ff;
    text-shadow:
      0 0 8px rgba(0, 230, 255, 0.9),
      0 0 18px rgba(255, 60, 200, 0.55);
    animation: sub-pulse 1.1s ease-in-out infinite;
  }

  .gate__label-sub::before,
  .gate__label-sub::after {
    color: #ff4fd8;
    text-shadow: 0 0 10px #ff4fd8;
  }

  .gate__label-sub::before {
    content: '▸ ';
    animation: blink 0.7s steps(1) infinite;
  }

  .gate__label-sub::after {
    content: ' ◂';
  }

  @keyframes sub-pulse {
    0%,
    100% {
      opacity: 0.55;
      letter-spacing: 0.38em;
    }
    50% {
      opacity: 1;
      letter-spacing: 0.52em;
    }
  }

  @keyframes blink {
    0%,
    49% {
      opacity: 1;
    }
    50%,
    100% {
      opacity: 0.15;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gate__noise,
    .gate__ring,
    .gate__halo,
    .gate__orbit,
    .gate__beam,
    .gate__chroma,
    .gate__corners span,
    .gate__underline,
    .gate__label-main,
    .gate__label-sub,
    .gate__label-sub::before {
      animation: none;
    }

    .gate__label-main::before,
    .gate__label-main::after {
      display: none;
    }
  }
</style>
