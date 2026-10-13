<script lang="ts">
  $effect(() => {
    const previousTitle = document.title
    document.title = 'Attention Required! | Cloudflare'

    return () => {
      document.title = previousTitle
    }
  })
</script>

<div class="cf" role="status" aria-live="polite">
  <section class="cf__hero" aria-hidden="true">
    <div class="cf__hero-inner">
      <div class="cf__standby-card">
        <div class="cf__dots">
          <span class="cf__dot cf__dot--1"></span>
          <span class="cf__dot cf__dot--2"></span>
          <span class="cf__dot cf__dot--3"></span>
        </div>
        <p class="cf__standby-text">Please stand by, while we are checking your browser...</p>
      </div>

      <div class="cf__browser">
        <div class="cf__browser-chrome">
          <span class="cf__browser-control"></span>
          <span class="cf__browser-control"></span>
          <span class="cf__browser-control"></span>
          <span class="cf__browser-url"></span>
        </div>
        <div class="cf__browser-body">
          <svg class="cf__warning-icon" viewBox="0 0 120 104" width="120" height="104" aria-hidden="true">
            <path
              fill="#F68B34"
              d="M60 8L8 96h104L60 8z"
              stroke="#F68B34"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <text
              x="60"
              y="78"
              text-anchor="middle"
              fill="#fff"
              font-family="system-ui, sans-serif"
              font-size="52"
              font-weight="700"
            >
              !
            </text>
          </svg>
        </div>
      </div>
    </div>
  </section>

  <section class="cf__info">
    <div class="cf__info-inner">
      <div class="cf__col">
        <h2 class="cf__info-heading">Why do I have to complete a CAPTCHA?</h2>
        <p class="cf__info-body">
          Completing the CAPTCHA proves you are a human and gives you temporary access to the web
          property.
        </p>
      </div>
      <div class="cf__col">
        <h2 class="cf__info-heading">What can I do to prevent this in the future?</h2>
        <p class="cf__info-body">
          If you are on a personal connection, like at home, you can run an anti-virus scan on your
          device to make sure it is not infected with malware.
        </p>
        <p class="cf__info-body">
          If you are at an office or shared network, you can ask the network administrator to run a
          scan across the network looking for misconfigured or infected devices.
        </p>
      </div>
    </div>
  </section>
</div>

<style>
  .cf {
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    overflow: auto;
    background: #fff;
    color: #313131;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      'Helvetica Neue',
      Arial,
      sans-serif;
    cursor: wait;
  }

  .cf__hero {
    flex: 0 0 55%;
    min-height: min(55vh, 420px);
    background: #ebebeb;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1.5rem;
  }

  .cf__hero-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(1.5rem, 4vw, 3rem);
    align-items: center;
    width: min(100%, 920px);
    max-width: 920px;
  }

  .cf__standby-card {
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    padding: 2.25rem 1.75rem 2rem;
    text-align: center;
  }

  .cf__dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    margin-bottom: 1.35rem;
  }

  .cf__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #f68b34;
    animation: cf-dot-pulse 1.2s ease-in-out infinite;
  }

  .cf__dot--1 {
    opacity: 0.35;
    animation-delay: 0s;
  }

  .cf__dot--2 {
    opacity: 0.65;
    animation-delay: 0.2s;
  }

  .cf__dot--3 {
    opacity: 1;
    animation-delay: 0.4s;
  }

  .cf__standby-text {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.45;
    color: #404040;
  }

  .cf__browser {
    width: 100%;
    max-width: 380px;
    margin: 0 auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    border-radius: 4px 4px 0 0;
    overflow: hidden;
  }

  .cf__browser-chrome {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    height: 36px;
    padding: 0 0.65rem;
    background: #4a4a4a;
  }

  .cf__browser-control {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #8a8a8a;
    flex-shrink: 0;
  }

  .cf__browser-url {
    flex: 1;
    height: 14px;
    margin-left: 0.5rem;
    border-radius: 2px;
    background: #6e6e6e;
  }

  .cf__browser-body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background: #fff;
    padding: 2rem;
  }

  .cf__warning-icon {
    display: block;
  }

  .cf__info {
    flex: 1;
    background: #fff;
    padding: 2.75rem 1.5rem 3rem;
  }

  .cf__info-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 5vw, 4rem);
    width: min(100%, 920px);
    max-width: 920px;
    margin: 0 auto;
  }

  .cf__info-heading {
    margin: 0 0 0.85rem;
    font-size: 1.35rem;
    font-weight: 400;
    line-height: 1.35;
    color: #313131;
  }

  .cf__info-body {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    line-height: 1.55;
    color: #404040;
  }

  .cf__info-body:last-child {
    margin-bottom: 0;
  }

  @keyframes cf-dot-pulse {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.92);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 720px) {
    .cf__hero {
      flex: none;
      min-height: auto;
    }

    .cf__hero-inner,
    .cf__info-inner {
      grid-template-columns: 1fr;
    }

    .cf__browser {
      max-width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cf__dot {
      animation: none;
    }

    .cf__dot--1 {
      opacity: 0.5;
    }

    .cf__dot--2 {
      opacity: 0.75;
    }

    .cf__dot--3 {
      opacity: 1;
    }
  }
</style>
