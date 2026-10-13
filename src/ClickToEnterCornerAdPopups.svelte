<script lang="ts">
  import { CLICK_TO_ENTER_AD_POPUP_IMAGE_URLS } from './clickToEnterAdPopupImages'
  import {
    buildAdPopupImageLayout,
    createPlacedAdPopup,
    estimateAdPopupHeight,
    estimateAdPopupWidth,
    loadAdPopupImageSize,
    pickRandomAdPopupImageUrl,
    pickAdPopupSkinForImageLayout,
    pickRandomAdPopupPlacement,
    pickImageDisplayWidth,
    type PlacedAdPopup,
  } from './clickToEnterAdPopups'

  interface Props {
    onenter: () => void
  }

  let { onenter }: Props = $props()

  const MAX_VISIBLE_ADS = 6
  const INITIAL_DELAY_MS = 1400
  const SPAWN_INTERVAL_MIN_MS = 3200
  const SPAWN_INTERVAL_MAX_MS = 6200

  let popups: PlacedAdPopup[] = $state([])
  let nextPopupId = 1
  let spawnGeneration = 0

  async function spawnPopup(): Promise<void> {
    if (popups.length >= MAX_VISIBLE_ADS) {
      return
    }

    const imageUrl = pickRandomAdPopupImageUrl(CLICK_TO_ENTER_AD_POPUP_IMAGE_URLS)
    if (imageUrl === null) {
      return
    }

    const generationAtStart = spawnGeneration

    try {
      const { naturalWidth, naturalHeight } = await loadAdPopupImageSize(imageUrl)
      if (generationAtStart !== spawnGeneration) {
        return
      }

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const displayWidthPx = pickImageDisplayWidth(viewportWidth, naturalWidth, naturalHeight)
      const imageLayout = buildAdPopupImageLayout(naturalWidth, naturalHeight, displayWidthPx)
      const skin = pickAdPopupSkinForImageLayout(imageLayout)

      const popupWidth = estimateAdPopupWidth(skin, imageLayout)
      const popupHeight = estimateAdPopupHeight(skin, imageLayout)
      const placement = pickRandomAdPopupPlacement(
        popupWidth,
        popupHeight,
        viewportWidth,
        viewportHeight,
        popups,
      )

      const popup = createPlacedAdPopup(nextPopupId, imageUrl, imageLayout, placement, skin)
      nextPopupId += 1
      popups = [...popups, popup]
    } catch {
      // Skip broken creatives.
    }
  }

  $effect(() => {
    if (CLICK_TO_ENTER_AD_POPUP_IMAGE_URLS.length === 0) {
      return
    }

    const scheduledTimeoutIds: number[] = []

    function scheduleNextSpawn(): void {
      const delay =
        SPAWN_INTERVAL_MIN_MS +
        Math.floor(Math.random() * (SPAWN_INTERVAL_MAX_MS - SPAWN_INTERVAL_MIN_MS))
      const timeoutId = window.setTimeout(() => {
        void spawnPopup().finally(() => {
          if (popups.length < MAX_VISIBLE_ADS) {
            scheduleNextSpawn()
          }
        })
      }, delay)
      scheduledTimeoutIds.push(timeoutId)
    }

    const initialTimeoutId = window.setTimeout(() => {
      void spawnPopup().finally(() => {
        scheduleNextSpawn()
      })
    }, INITIAL_DELAY_MS)
    scheduledTimeoutIds.push(initialTimeoutId)

    return () => {
      spawnGeneration += 1
      for (const timeoutId of scheduledTimeoutIds) {
        window.clearTimeout(timeoutId)
      }
    }
  })

  function handleAdActivate(event: MouseEvent): void {
    event.stopPropagation()
    event.preventDefault()
    onenter()
  }

  function popupStyle(popup: PlacedAdPopup): string {
    const widthPx = estimateAdPopupWidth(popup.skin, popup.imageLayout)
    return [
      `left: ${popup.placement.leftPx}px`,
      `top: ${popup.placement.topPx}px`,
      `width: ${widthPx}px`,
      `--ad-image-width: ${popup.imageLayout.displayWidthPx}px`,
      `--ad-image-height: ${popup.imageLayout.displayHeightPx}px`,
    ].join('; ')
  }
</script>

<div class="corner-ads" aria-hidden="true">
  {#each popups as popup (popup.id)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="corner-ad corner-ad--{popup.skin}"
      style={popupStyle(popup)}
      onclick={handleAdActivate}
    >
      <header class="corner-ad__chrome">
        <span class="corner-ad__sponsor">{popup.sponsorLine}</span>
        <button type="button" class="corner-ad__close" aria-label="Close advertisement">
          ×
        </button>
      </header>

      {#if popup.skin === 'display'}
        <div class="corner-ad__media">
          <img
            class="corner-ad__image"
            src={encodeURI(popup.imageUrl)}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="corner-ad__body">
          <p class="corner-ad__headline">{popup.headline}</p>
          <span class="corner-ad__cta">{popup.ctaLabel}</span>
        </div>
      {:else if popup.skin === 'native'}
        <div class="corner-ad__native">
          <div class="corner-ad__media corner-ad__media--native">
            <img
            class="corner-ad__image"
            src={encodeURI(popup.imageUrl)}
            alt=""
            loading="lazy"
            decoding="async"
          />
          </div>
          <div class="corner-ad__native-copy">
            <p class="corner-ad__headline">{popup.headline}</p>
            <span class="corner-ad__cta corner-ad__cta--pill">{popup.ctaLabel}</span>
          </div>
        </div>
      {:else}
        <div class="corner-ad__compact">
          <div class="corner-ad__media">
            <img
            class="corner-ad__image"
            src={encodeURI(popup.imageUrl)}
            alt=""
            loading="lazy"
            decoding="async"
          />
          </div>
          <div class="corner-ad__compact-bar">
            <span class="corner-ad__headline corner-ad__headline--compact">{popup.headline}</span>
            <button type="button" class="corner-ad__cta corner-ad__cta--btn">
              {popup.ctaLabel}
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .corner-ads {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 14;
  }

  .corner-ad {
    position: absolute;
    pointer-events: auto;
    cursor: pointer;
    max-width: calc(100vw - 28px);
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      'Helvetica Neue',
      Arial,
      sans-serif;
    background: #f8f9fa;
    border: 1px solid #dadce0;
    border-radius: 4px;
    box-shadow:
      0 1px 2px rgba(60, 64, 67, 0.3),
      0 6px 16px rgba(60, 64, 67, 0.22);
    overflow: hidden;
    animation: corner-ad-enter 0.38s cubic-bezier(0.2, 0.9, 0.25, 1) both;
    transform-origin: center center;
  }

  .corner-ad__chrome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem;
    min-height: 26px;
    padding: 0.2rem 0.35rem 0.2rem 0.5rem;
    background: linear-gradient(180deg, #ffffff, #f1f3f4);
    border-bottom: 1px solid #e0e0e0;
    font-size: 0.62rem;
    color: #5f6368;
    line-height: 1.2;
    box-sizing: border-box;
  }

  .corner-ad__sponsor {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .corner-ad__close {
    flex: 0 0 auto;
    width: 1.35rem;
    height: 1.35rem;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 2px;
    background: transparent;
    color: #5f6368;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }

  .corner-ad__close:hover {
    background: rgba(60, 64, 67, 0.08);
    color: #202124;
  }

  .corner-ad__media {
    width: var(--ad-image-width);
    height: var(--ad-image-height);
    max-width: 100%;
    margin: 0 auto;
    background: #e8eaed;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .corner-ad__media--native {
    flex: 0 0 var(--ad-image-width);
    margin: 0;
    border-bottom: none;
    border-right: 1px solid #e0e0e0;
  }

  .corner-ad__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }

  .corner-ad__body {
    padding: 0.45rem 0.55rem 0.55rem;
    background: #fff;
  }

  .corner-ad__headline {
    margin: 0 0 0.35rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: #202124;
    line-height: 1.25;
  }

  .corner-ad__headline--compact {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 500;
    flex: 1;
    min-width: 0;
  }

  .corner-ad__cta {
    font-size: 0.72rem;
    font-weight: 600;
    color: #1a73e8;
    cursor: pointer;
  }

  .corner-ad__cta--pill {
    display: inline-block;
    margin-top: 0.25rem;
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    background: #e8f0fe;
    color: #185abc;
    font-size: 0.65rem;
  }

  .corner-ad__cta--btn {
    flex: 0 0 auto;
    margin: 0;
    padding: 0.2rem 0.55rem;
    border: 1px solid #dadce0;
    border-radius: 3px;
    background: #fff;
    font: inherit;
    font-size: 0.65rem;
    color: #1a73e8;
    cursor: pointer;
  }

  .corner-ad__native {
    display: flex;
    align-items: stretch;
    background: #fff;
  }

  .corner-ad__native-copy {
    flex: 1;
    min-width: 0;
    padding: 0.45rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .corner-ad__compact {
    background: #fff;
  }

  .corner-ad__compact-bar {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.45rem;
  }

  @keyframes corner-ad-enter {
    0% {
      opacity: 0;
      transform: scale(0.82) translateY(8px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
