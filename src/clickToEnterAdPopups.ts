export type AdPopupSkin = 'display' | 'native' | 'compact'

export interface AdPopupPlacement {
  leftPx: number
  topPx: number
}

export interface AdPopupImageLayout {
  displayWidthPx: number
  displayHeightPx: number
  naturalWidth: number
  naturalHeight: number
}

export interface PlacedAdPopup {
  id: number
  skin: AdPopupSkin
  imageUrl: string
  headline: string
  sponsorLine: string
  ctaLabel: string
  placement: AdPopupPlacement
  imageLayout: AdPopupImageLayout
}

export const CLICK_TO_ENTER_AD_POPUP_FOLDER = '/ad-popups'

const AD_HEADLINES = [
  'CONGRATULATIONS! You Are Today\'s Lucky Visitor!',
  'You May Be A Winner! Click Here To See If You Won An Apple iPad!',
  'Hot Singles Are Waiting In Your Area',
  'Your Computer May Be Infected With (5) Viruses!',
  'Work From Home And Earn $7,395/Week',
  'Claim Your $1,000 Walmart Gift Card',
  'WARNING: Your Flash Player May Be Out Of Date',
  'Doctors Stunned: New Treatment Melts Belly Fat',
  'Make $87/Hour From Home! (As Seen on CNN)',
  'Download FREE Ringtones NOW!!!',
  'Seniors Born 1939-1969 May Qualify For New Benefit',
  'Lose 30 Pounds In 30 Days - No Diet, No Exercise',
]

const AD_SPONSOR_LINES = [
  'Ad',
  'Sponsored',
  'Advertisement',
  'Promoted',
  'AdChoices',
]

const AD_CTA_LABELS = [
  'Learn more',
  'Shop now',
  'Install',
  'Claim offer',
  'Open',
  'Continue',
]

const CHROME_HEIGHT_PX = 26
const COMPACT_MIN_ASPECT_RATIO = 1.45
const NATIVE_MAX_DISPLAY_HEIGHT_PX = 128
const PORTRAIT_MAX_ASPECT_RATIO = 0.88
const DISPLAY_BODY_HEIGHT_PX = 54
const NATIVE_COPY_HEIGHT_PX = 72
const COMPACT_BAR_HEIGHT_PX = 38
const VIEWPORT_MARGIN_PX = 14
const TOP_SAFE_INSET_PX = 42
const BOTTOM_SAFE_INSET_PX = 152
const MIN_IMAGE_DISPLAY_WIDTH_PX = 120
const MAX_IMAGE_DISPLAY_WIDTH_PX = 200
const WIDE_MIN_IMAGE_DISPLAY_WIDTH_PX = 200
const WIDE_MAX_IMAGE_DISPLAY_WIDTH_PX = 340
const WIDE_MIN_IMAGE_DISPLAY_HEIGHT_PX = 96
const LANDSCAPE_MIN_IMAGE_DISPLAY_WIDTH_PX = 130
const LANDSCAPE_MAX_IMAGE_DISPLAY_WIDTH_PX = 240
const PLACEMENT_ATTEMPTS = 24
const PLACEMENT_PADDING_PX = 10

export function pickRandomAdPopupImageUrl(imageUrls: readonly string[]): string | null {
  if (imageUrls.length === 0) {
    return null
  }
  const index = Math.floor(Math.random() * imageUrls.length)
  return imageUrls[index] ?? null
}

export function pickAdPopupSkinForImageLayout(imageLayout: AdPopupImageLayout): AdPopupSkin {
  const aspectRatio = imageLayout.naturalWidth / imageLayout.naturalHeight
  const { displayWidthPx, displayHeightPx } = imageLayout

  if (aspectRatio >= COMPACT_MIN_ASPECT_RATIO) {
    return 'compact'
  }

  if (aspectRatio <= PORTRAIT_MAX_ASPECT_RATIO || displayHeightPx > displayWidthPx) {
    return 'display'
  }

  if (displayHeightPx <= NATIVE_MAX_DISPLAY_HEIGHT_PX) {
    return 'native'
  }

  return 'display'
}

function pickFrom<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index] as T
}

export function loadAdPopupImageSize(imageUrl: string): Promise<{ naturalWidth: number; naturalHeight: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      const naturalWidth = image.naturalWidth
      const naturalHeight = image.naturalHeight
      if (naturalWidth <= 0 || naturalHeight <= 0) {
        reject(new Error('Invalid image dimensions'))
        return
      }
      resolve({ naturalWidth, naturalHeight })
    }
    image.onerror = () => {
      reject(new Error('Failed to load ad image'))
    }
    image.src = imageUrl
  })
}

interface ImageDisplayWidthLimits {
  minWidthPx: number
  maxWidthPx: number
  viewportCapMinFraction: number
  viewportCapMaxFraction: number
  minDisplayHeightPx: number | null
}

function imageDisplayWidthLimitsForAspect(aspectRatio: number): ImageDisplayWidthLimits {
  if (aspectRatio >= COMPACT_MIN_ASPECT_RATIO) {
    return {
      minWidthPx: WIDE_MIN_IMAGE_DISPLAY_WIDTH_PX,
      maxWidthPx: WIDE_MAX_IMAGE_DISPLAY_WIDTH_PX,
      viewportCapMinFraction: 0.28,
      viewportCapMaxFraction: 0.44,
      minDisplayHeightPx: WIDE_MIN_IMAGE_DISPLAY_HEIGHT_PX,
    }
  }

  if (aspectRatio <= PORTRAIT_MAX_ASPECT_RATIO) {
    return {
      minWidthPx: MIN_IMAGE_DISPLAY_WIDTH_PX,
      maxWidthPx: MAX_IMAGE_DISPLAY_WIDTH_PX,
      viewportCapMinFraction: 0.16,
      viewportCapMaxFraction: 0.28,
      minDisplayHeightPx: null,
    }
  }

  return {
    minWidthPx: LANDSCAPE_MIN_IMAGE_DISPLAY_WIDTH_PX,
    maxWidthPx: LANDSCAPE_MAX_IMAGE_DISPLAY_WIDTH_PX,
    viewportCapMinFraction: 0.2,
    viewportCapMaxFraction: 0.34,
    minDisplayHeightPx: null,
  }
}

export function pickImageDisplayWidth(
  viewportWidth: number,
  naturalWidth: number,
  naturalHeight: number,
): number {
  const aspectRatio = naturalWidth / naturalHeight
  const limits = imageDisplayWidthLimitsForAspect(aspectRatio)
  const viewportCap =
    viewportWidth *
    (limits.viewportCapMinFraction +
      Math.random() * (limits.viewportCapMaxFraction - limits.viewportCapMinFraction))
  const randomWidth =
    limits.minWidthPx + Math.random() * (limits.maxWidthPx - limits.minWidthPx)

  let scaledWidth = Math.min(randomWidth, viewportCap)
  scaledWidth = Math.min(limits.maxWidthPx, Math.max(limits.minWidthPx, scaledWidth))

  if (limits.minDisplayHeightPx !== null) {
    const widthForMinHeight = limits.minDisplayHeightPx * aspectRatio
    const boostedWidth = Math.min(widthForMinHeight, viewportCap, limits.maxWidthPx)
    scaledWidth = Math.max(scaledWidth, boostedWidth)
  }

  return Math.round(scaledWidth)
}

export function buildAdPopupImageLayout(
  naturalWidth: number,
  naturalHeight: number,
  displayWidthPx: number,
): AdPopupImageLayout {
  const aspectRatio = naturalWidth / naturalHeight
  const displayHeightPx = Math.round(displayWidthPx / aspectRatio)
  return {
    displayWidthPx,
    displayHeightPx,
    naturalWidth,
    naturalHeight,
  }
}

export function estimateAdPopupHeight(skin: AdPopupSkin, imageLayout: AdPopupImageLayout): number {
  switch (skin) {
    case 'display':
      return CHROME_HEIGHT_PX + imageLayout.displayHeightPx + DISPLAY_BODY_HEIGHT_PX
    case 'native':
      return CHROME_HEIGHT_PX + Math.max(imageLayout.displayHeightPx, NATIVE_COPY_HEIGHT_PX)
    case 'compact':
      return CHROME_HEIGHT_PX + imageLayout.displayHeightPx + COMPACT_BAR_HEIGHT_PX
    default:
      return CHROME_HEIGHT_PX + imageLayout.displayHeightPx
  }
}

export function estimateAdPopupWidth(skin: AdPopupSkin, imageLayout: AdPopupImageLayout): number {
  if (skin === 'native') {
    return imageLayout.displayWidthPx + 108
  }
  return imageLayout.displayWidthPx
}

interface PlacementRect {
  left: number
  top: number
  width: number
  height: number
}

function rectsOverlap(first: PlacementRect, second: PlacementRect): boolean {
  const paddedFirst: PlacementRect = {
    left: first.left - PLACEMENT_PADDING_PX,
    top: first.top - PLACEMENT_PADDING_PX,
    width: first.width + PLACEMENT_PADDING_PX * 2,
    height: first.height + PLACEMENT_PADDING_PX * 2,
  }
  return !(
    paddedFirst.left + paddedFirst.width <= second.left ||
    second.left + second.width <= paddedFirst.left ||
    paddedFirst.top + paddedFirst.height <= second.top ||
    second.top + second.height <= paddedFirst.top
  )
}

export function pickRandomAdPopupPlacement(
  popupWidth: number,
  popupHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  existingPopups: readonly PlacedAdPopup[],
): AdPopupPlacement {
  const minLeft = VIEWPORT_MARGIN_PX
  const minTop = TOP_SAFE_INSET_PX
  const maxLeft = Math.max(minLeft, viewportWidth - popupWidth - VIEWPORT_MARGIN_PX)
  const maxTop = Math.max(
    minTop,
    viewportHeight - popupHeight - BOTTOM_SAFE_INSET_PX,
  )

  const existingRects: PlacementRect[] = existingPopups.map((popup) => ({
    left: popup.placement.leftPx,
    top: popup.placement.topPx,
    width: estimateAdPopupWidth(popup.skin, popup.imageLayout),
    height: estimateAdPopupHeight(popup.skin, popup.imageLayout),
  }))

  for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt += 1) {
    const leftPx = Math.round(minLeft + Math.random() * (maxLeft - minLeft))
    const topPx = Math.round(minTop + Math.random() * (maxTop - minTop))
    const candidate: PlacementRect = {
      left: leftPx,
      top: topPx,
      width: popupWidth,
      height: popupHeight,
    }
    const collides = existingRects.some((rect) => rectsOverlap(candidate, rect))
    if (!collides) {
      return { leftPx, topPx }
    }
  }

  return {
    leftPx: Math.round(minLeft + Math.random() * (maxLeft - minLeft)),
    topPx: Math.round(minTop + Math.random() * (maxTop - minTop)),
  }
}

export function createPlacedAdPopup(
  id: number,
  imageUrl: string,
  imageLayout: AdPopupImageLayout,
  placement: AdPopupPlacement,
  skin: AdPopupSkin,
): PlacedAdPopup {
  return {
    id,
    skin,
    imageUrl,
    headline: pickFrom(AD_HEADLINES),
    sponsorLine: pickFrom(AD_SPONSOR_LINES),
    ctaLabel: pickFrom(AD_CTA_LABELS),
    placement,
    imageLayout,
  }
}
