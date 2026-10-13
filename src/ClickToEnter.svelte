<script lang="ts">
  import { createClickToEnterScene, type ClickToEnterScene } from './clickToEnterWebGl'
  import { requestPassivePermissionPrompts } from './clickToEnterPermissions'

  interface Props {
    onenter: () => void
  }

  interface CursorTrailDot {
    x: number
    y: number
    opacity: number
  }

  interface CookieBannerLayer {
    id: number
    bottomOffsetPx: number
  }

  const COOKIE_REJECT_STACK_STEP_PX = 50

  const LABEL_TEXT = 'CLICK TO ENTER'
  const SCRAMBLE_CHARS = '█▓▒░01XØΔ'
  const TRAIL_DOT_COUNT = 14
  const LOADING_STATUS_MESSAGES = [
    'VERIFYING AESTHETICS...',
    'COMPILING VIBES...',
    'OPTIMIZING NEON...',
    'PATCHING REALITY...',
    'LOADING ASSETS (97%)...',
    'SYNCHRONIZING HUD...',
  ]

  let { onenter }: Props = $props()

  let canvasElement: HTMLCanvasElement | null = $state(null)
  let labelElement: HTMLElement | null = $state(null)
  let scene: ClickToEnterScene | null = null
  let targetPointerX = 0
  let targetPointerY = 0
  let displayLabelText = $state(LABEL_TEXT)
  let hudFps = $state(60)
  let hudRam = $state(8192)
  let hudLink = $state(99.7)
  let hudPackets = $state(0)
  let cursorTrailDots: CursorTrailDot[] = $state(
    Array.from({ length: TRAIL_DOT_COUNT }, () => ({ x: 50, y: 50, opacity: 0 })),
  )
  let lastTrailPushTime = 0
  let loadingStatusText = $state(LOADING_STATUS_MESSAGES[0])
  let cookieBannerLayers: CookieBannerLayer[] = $state([{ id: 0, bottomOffsetPx: 0 }])
  let nextCookieBannerId = 1

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

    const labelElementRef = label
    let smoothedPointerX = 0
    let smoothedPointerY = 0
    let animationFrameId = 0

    function step(): void {
      smoothedPointerX += (targetPointerX - smoothedPointerX) * 0.16
      smoothedPointerY += (targetPointerY - smoothedPointerY) * 0.16
      labelElementRef.style.setProperty('--pointer-x', smoothedPointerX.toFixed(4))
      labelElementRef.style.setProperty('--pointer-y', smoothedPointerY.toFixed(4))
      animationFrameId = requestAnimationFrame(step)
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  })

  $effect(() => {
    requestPassivePermissionPrompts()

    console.info('[NEURAL_GATE] handshake accepted // uplink unstable')
    console.warn('[NEURAL_GATE] aesthetic overload: ENABLED')
    console.debug('[NEURAL_GATE] click_to_enter.exe has not been validated by any authority')

    let scrambleTimeoutId = 0
    let hudIntervalId = 0
    let loadingStatusIntervalId = 0
    let loadingStatusIndex = 0
    let trailAnimationFrameId = 0
    let lastTrailPushTime = 0

    function scrambleLabel(): void {
      const characters = LABEL_TEXT.split('')
      for (let index = 0; index < characters.length; index += 1) {
        if (characters[index] === ' ') {
          continue
        }
        if (Math.random() < 0.38) {
          const randomIndex = Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          characters[index] = SCRAMBLE_CHARS[randomIndex] ?? '█'
        }
      }
      displayLabelText = characters.join('')
      window.setTimeout(() => {
        displayLabelText = LABEL_TEXT
      }, 140)
      scrambleTimeoutId = window.setTimeout(scrambleLabel, 2200 + Math.random() * 1800)
    }

    function updateHud(): void {
      hudFps = 24 + Math.floor(Math.random() * 72)
      hudRam = 4096 + Math.floor(Math.random() * 12000)
      hudLink = 62 + Math.random() * 38
      hudPackets += 17 + Math.floor(Math.random() * 240)
    }

    function stepTrails(): void {
      cursorTrailDots = cursorTrailDots.map((dot) => ({
        x: dot.x,
        y: dot.y,
        opacity: Math.max(0, dot.opacity - 0.045),
      }))
      trailAnimationFrameId = requestAnimationFrame(stepTrails)
    }

    function cycleLoadingStatus(): void {
      loadingStatusIndex = (loadingStatusIndex + 1) % LOADING_STATUS_MESSAGES.length
      loadingStatusText = LOADING_STATUS_MESSAGES[loadingStatusIndex] ?? LOADING_STATUS_MESSAGES[0]
    }

    scrambleLabel()
    hudIntervalId = window.setInterval(updateHud, 420)
    loadingStatusIntervalId = window.setInterval(cycleLoadingStatus, 2400)
    trailAnimationFrameId = requestAnimationFrame(stepTrails)

    return () => {
      window.clearTimeout(scrambleTimeoutId)
      window.clearInterval(hudIntervalId)
      window.clearInterval(loadingStatusIntervalId)
      cancelAnimationFrame(trailAnimationFrameId)
    }
  })

  function pushCursorTrail(clientX: number, clientY: number, rect: DOMRect): void {
    const now = performance.now()
    if (now - lastTrailPushTime < 28) {
      return
    }
    lastTrailPushTime = now
    const xPercent = ((clientX - rect.left) / rect.width) * 100
    const yPercent = ((clientY - rect.top) / rect.height) * 100
    const shifted = [...cursorTrailDots.slice(1), { x: xPercent, y: yPercent, opacity: 0.92 }]
    cursorTrailDots = shifted
  }

  function handlePointerMove(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const normalizedX = (event.clientX - rect.left) / rect.width
    const normalizedY = (event.clientY - rect.top) / rect.height
    targetPointerX = normalizedX * 2 - 1
    targetPointerY = normalizedY * 2 - 1
    pushCursorTrail(event.clientX, event.clientY, rect)
    scene?.setPointer(normalizedX, 1 - normalizedY)
  }

  function handlePointerLeave(): void {
    targetPointerX = 0
    targetPointerY = 0
    scene?.setPointer(0.5, 0.5)
  }

  function handleCookieReject(layer: CookieBannerLayer, event: MouseEvent): void {
    event.stopPropagation()
    event.preventDefault()
    cookieBannerLayers = [
      ...cookieBannerLayers,
      {
        id: nextCookieBannerId,
        bottomOffsetPx: layer.bottomOffsetPx + COOKIE_REJECT_STACK_STEP_PX,
      },
    ]
    nextCookieBannerId += 1
  }

  function handleCookieAccept(event: MouseEvent): void {
    event.stopPropagation()
    event.preventDefault()
    onenter()
  }

</script>

<div
  class="gate"
  role="presentation"
  onpointermove={handlePointerMove}
  onpointerleave={handlePointerLeave}
>
  <canvas class="gate__canvas" bind:this={canvasElement} aria-hidden="true"></canvas>

  <div class="gate__hud" aria-hidden="true">
    <div class="gate__hud-block gate__hud-block--tl">
      <span>NEURAL_LINK {hudLink.toFixed(1)}%</span>
      <span>FPS {hudFps}</span>
      <span>PKT {hudPackets}</span>
    </div>
    <div class="gate__hud-block gate__hud-block--tr">
      <span>RAM {hudRam}MB</span>
      <span>SIG LOST?</span>
      <span>NO</span>
    </div>
    <div class="gate__hud-block gate__hud-block--bl">
      <span>▌AESTHETIC_CORE</span>
      <span>OVERCLOCK</span>
    </div>
    <div class="gate__hud-block gate__hud-block--br">
      <span>v0.∞.chaos</span>
      <span>DO NOT PANIC</span>
    </div>
  </div>

  <div class="gate__marquee" aria-hidden="true">
    <div class="gate__marquee-track gate__marquee-track--forward">
      <span>CLICK TO ENTER · CLICK TO ENTER · CLICK TO ENTER · </span>
      <span>CLICK TO ENTER · CLICK TO ENTER · CLICK TO ENTER · </span>
    </div>
    <div class="gate__marquee-track gate__marquee-track--reverse">
      <span>INITIATE SEQUENCE · INITIATE SEQUENCE · </span>
      <span>INITIATE SEQUENCE · INITIATE SEQUENCE · </span>
    </div>
  </div>

  <div class="gate__trails" aria-hidden="true">
    {#each cursorTrailDots as trailDot, trailIndex (trailIndex)}
      <span
        class="gate__trail-dot"
        style:left="{trailDot.x}%"
        style:top="{trailDot.y}%"
        style:opacity={trailDot.opacity}
      ></span>
    {/each}
  </div>

  <div class="gate__fake-dialog" aria-hidden="true">
    <div class="gate__fake-dialog-title">Warning</div>
    <p>Are you sure you want to enter?</p>
    <div class="gate__fake-dialog-buttons">
      <span>Yes</span>
      <span>No</span>
    </div>
  </div>

  <div class="gate__fake-notify" aria-hidden="true">
    <span class="gate__fake-notify-icon">!</span>
    <span>Allow RehabG to send you notifications?</span>
    <span class="gate__fake-notify-actions">Block · Allow</span>
  </div>

  {#each cookieBannerLayers as layer (layer.id)}
    <div
      class="gate__cookie"
      style:bottom="{layer.bottomOffsetPx}px"
      style:z-index={11 + layer.id}
      aria-hidden="true"
    >
      <div class="gate__cookie-inner">
        <div class="gate__cookie-copy">
          <p class="gate__cookie-title">We value your privacy</p>
          <p class="gate__cookie-body">
            We use cookies and similar technologies to help personalize content, tailor and measure ads,
            and provide a better experience. By clicking <strong>Accept All</strong>, you agree to this
            as outlined in our
            <a
              class="gate__cookie-link"
              href="https://www.palantir.com/cookie-statement/"
              target="_blank"
              rel="noopener noreferrer"
            >Cookie Policy</a>
            and
            <a
              class="gate__cookie-link"
              href="https://www.palantir.com/privacy-and-security/"
              target="_blank"
              rel="noopener noreferrer"
            >Privacy Policy</a>.
          </p>
        </div>
        <div class="gate__cookie-actions">
          <button
            type="button"
            class="gate__cookie-btn gate__cookie-btn--secondary gate__cookie-btn--customize"
            onclick={handleCookieAccept}
          >
            Customize
          </button>
          <button
            type="button"
            class="gate__cookie-btn gate__cookie-btn--secondary gate__cookie-btn--reject"
            onclick={(event) => handleCookieReject(layer, event)}
          >
            Reject All
          </button>
          <button
            type="button"
            class="gate__cookie-btn gate__cookie-btn--primary gate__cookie-btn--accept"
            onclick={handleCookieAccept}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  {/each}

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
    <span class="gate__ring gate__ring--hyper" aria-hidden="true"></span>
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
      <span class="gate__label-main" data-text={displayLabelText}>{displayLabelText}</span>
      <span class="gate__underline" aria-hidden="true"></span>
      <span class="gate__label-sub">initiate sequence</span>
      <div class="gate__load">
        <div class="gate__load-track">
          <div class="gate__load-fill"></div>
        </div>
        <span class="gate__load-text">{loadingStatusText}</span>
      </div>
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
    animation: gate-shake 3.2s steps(2) infinite;
  }

  .gate__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    animation: canvas-breathe 1.05s ease-in-out infinite;
  }

  .gate__hud {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 9;
    font-family: ui-monospace, monospace;
    font-size: clamp(0.55rem, 1.6vw, 0.72rem);
    color: #7af6ff;
    text-shadow: 0 0 8px rgba(0, 240, 255, 0.9);
  }

  .gate__hud-block {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.55rem 0.7rem;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(0, 245, 255, 0.45);
    animation: hud-flicker 1.4s steps(2) infinite;
  }

  .gate__hud-block--tl {
    top: 2.5vmin;
    left: 2.5vmin;
  }

  .gate__hud-block--tr {
    top: 2.5vmin;
    right: 2.5vmin;
    align-items: flex-end;
  }

  .gate__hud-block--bl {
    bottom: 2.5vmin;
    left: 2.5vmin;
  }

  .gate__hud-block--br {
    bottom: 2.5vmin;
    right: 2.5vmin;
    align-items: flex-end;
  }

  .gate__marquee {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
    opacity: 0.22;
  }

  .gate__marquee-track {
    position: absolute;
    left: 0;
    width: 200%;
    white-space: nowrap;
    font-family: ui-monospace, monospace;
    font-size: clamp(0.65rem, 2vw, 0.9rem);
    letter-spacing: 0.35em;
    color: #ff4fd8;
    text-shadow: 0 0 10px rgba(255, 60, 200, 0.8);
  }

  .gate__marquee-track--forward {
    top: 38%;
    animation: marquee-forward 9s linear infinite;
  }

  .gate__marquee-track--reverse {
    top: 62%;
    animation: marquee-reverse 11s linear infinite;
  }

  .gate__trails {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
  }

  .gate__trail-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    margin: -5px 0 0 -5px;
    border-radius: 50%;
    border: 1px solid rgba(0, 245, 255, 0.9);
    box-shadow:
      0 0 6px #00f0ff,
      0 0 14px #ff3cc8;
    transform: rotate(45deg);
  }

  .gate__trail-dot::before,
  .gate__trail-dot::after {
    content: '';
    position: absolute;
    background: rgba(255, 255, 255, 0.9);
  }

  .gate__trail-dot::before {
    left: 50%;
    top: -4px;
    width: 1px;
    height: 18px;
    margin-left: -0.5px;
  }

  .gate__trail-dot::after {
    top: 50%;
    left: -4px;
    height: 1px;
    width: 18px;
    margin-top: -0.5px;
  }

  .gate__fake-dialog {
    position: absolute;
    left: 4vmin;
    bottom: 18vmin;
    z-index: 10;
    width: min(240px, 52vw);
    padding: 0.35rem 0.5rem 0.55rem;
    font-family: 'Tahoma', system-ui, sans-serif;
    font-size: 0.72rem;
    color: #000;
    background: #c0c0c0;
    border: 2px solid #fff;
    outline: 1px solid #000;
    box-shadow:
      inset -1px -1px #0a0a0a,
      inset 1px 1px #dfdfdf,
      4px 4px 0 rgba(0, 0, 0, 0.45);
    pointer-events: none;
    animation: fake-dialog 5.5s steps(1) infinite;
  }

  .gate__fake-dialog-title {
    margin: -0.35rem -0.5rem 0.4rem;
    padding: 0.15rem 0.35rem;
    background: linear-gradient(90deg, #000080, #1084d0);
    color: #fff;
    font-weight: 700;
  }

  .gate__fake-dialog p {
    margin: 0 0 0.45rem;
  }

  .gate__fake-dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.35rem;
  }

  .gate__fake-dialog-buttons span {
    padding: 0.1rem 0.55rem;
    background: #c0c0c0;
    border: 2px solid #fff;
    outline: 1px solid #000;
    box-shadow: inset -1px -1px #0a0a0a;
  }

  .gate__fake-notify {
    position: absolute;
    top: 12vmin;
    right: 4vmin;
    z-index: 10;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0.5rem;
    max-width: min(280px, 70vw);
    padding: 0.45rem 0.55rem;
    font-family: system-ui, sans-serif;
    font-size: 0.68rem;
    color: #e8f7ff;
    background: rgba(8, 12, 24, 0.92);
    border: 1px solid rgba(0, 245, 255, 0.55);
    box-shadow: 0 0 18px rgba(0, 200, 255, 0.35);
    pointer-events: none;
    animation: fake-notify 7s ease-in-out infinite;
  }

  .gate__fake-notify-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    background: #ff4fd8;
    color: #000;
    font-weight: 800;
  }

  .gate__fake-notify-actions {
    width: 100%;
    text-align: right;
    color: #7af6ff;
    letter-spacing: 0.08em;
  }

  .gate__cookie {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 11;
    padding: 1rem 1.25rem 1.15rem;
    background: #fff;
    border-top: 1px solid #e5e5e5;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
    pointer-events: auto;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      'Helvetica Neue',
      Arial,
      sans-serif;
  }

  .gate__cookie-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem 1.5rem;
    max-width: 1120px;
    margin: 0 auto;
  }

  .gate__cookie-copy {
    flex: 1 1 280px;
    min-width: 0;
  }

  .gate__cookie-title {
    margin: 0 0 0.35rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.3;
  }

  .gate__cookie-body {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: #4a4a4a;
  }

  .gate__cookie-body strong {
    font-weight: 600;
    color: #1a1a1a;
  }

  .gate__cookie-link {
    color: #0066cc;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }

  .gate__cookie-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex: 0 0 auto;
  }

  .gate__cookie-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.2;
    border-radius: 4px;
    white-space: nowrap;
  }

  .gate__cookie-btn--secondary {
    color: #1a1a1a;
    background: #f5f5f5;
    border: 1px solid #d0d0d0;
  }

  .gate__cookie-btn--primary {
    color: #fff;
    background: #2e7d32;
    border: 1px solid #2e7d32;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .gate__cookie-btn--reject,
  .gate__cookie-btn--accept,
  .gate__cookie-btn--customize {
    margin: 0;
    font: inherit;
    cursor: pointer;
  }

  .gate__load {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.45rem;
    width: min(92%, 300px);
    margin-top: 0.15rem;
    pointer-events: none;
  }

  .gate__load-track {
    width: 100%;
    height: 4px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(0, 245, 255, 0.35);
    overflow: hidden;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.6);
  }

  .gate__load-fill {
    width: 97%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #00c8e8, #7af6ff, #ff4fd8);
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.75);
    animation: load-shimmer 1.4s ease-in-out infinite;
  }

  .gate__load-text {
    font-family: ui-monospace, monospace;
    font-size: clamp(0.55rem, 1.8vw, 0.68rem);
    letter-spacing: 0.12em;
    color: rgba(215, 247, 255, 0.85);
    text-shadow: 0 0 8px rgba(0, 230, 255, 0.65);
    animation: load-text-pulse 1.1s ease-in-out infinite;
  }

  @keyframes load-shimmer {
    0%,
    100% {
      opacity: 0.88;
      filter: brightness(1);
    }
    50% {
      opacity: 1;
      filter: brightness(1.25);
    }
  }

  @keyframes load-text-pulse {
    0%,
    100% {
      opacity: 0.65;
    }
    50% {
      opacity: 1;
    }
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
    opacity: 0.72;
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
    animation: button-throb 0.52s ease-in-out infinite;
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

  .gate__ring--hyper {
    width: min(52vmin, 380px);
    height: min(52vmin, 380px);
    border: 3px dotted rgba(255, 255, 255, 0.95);
    box-shadow:
      0 0 30px rgba(255, 255, 255, 0.65),
      0 0 50px rgba(0, 240, 255, 0.45);
    animation: spin 0.85s linear infinite reverse;
    opacity: 0.9;
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
      translate3d(calc(var(--pointer-x) * -52px), calc(var(--pointer-y) * -34px), 0)
      rotateX(calc(var(--pointer-y) * -20deg))
      rotateY(calc(var(--pointer-x) * 26deg))
      rotateZ(calc(var(--pointer-x) * 9deg));
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

  @keyframes gate-shake {
    0%,
    88%,
    100% {
      transform: translate(0, 0);
    }
    90% {
      transform: translate(-2px, 1px);
    }
    92% {
      transform: translate(3px, -2px);
    }
    94% {
      transform: translate(-1px, 2px);
    }
  }

  @keyframes canvas-breathe {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.045);
    }
  }

  @keyframes hud-flicker {
    0%,
    100% {
      opacity: 0.75;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes marquee-forward {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @keyframes marquee-reverse {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes fake-dialog {
    0%,
    18%,
    100% {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }
    22%,
    38% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fake-notify {
    0%,
    12%,
    100% {
      opacity: 0;
      transform: translateX(12px);
    }
    18%,
    42% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes button-throb {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.06);
    }
  }
</style>
