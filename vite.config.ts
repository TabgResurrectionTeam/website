import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const adPopupDirectory = path.join(projectRoot, 'public', 'ad-popups')
const adPopupVirtualModuleId = 'virtual:click-to-enter-ad-images'
const adPopupResolvedVirtualModuleId = '\0' + adPopupVirtualModuleId
const adPopupImagePattern = /\.(png|jpe?g|webp|gif|svg)$/i

function listClickToEnterAdPopupImageUrls(): string[] {
  if (!fs.existsSync(adPopupDirectory)) {
    return []
  }

  return fs
    .readdirSync(adPopupDirectory)
    .filter((fileName) => adPopupImagePattern.test(fileName))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => `/ad-popups/${fileName}`)
}

function clickToEnterAdPopupImagesPlugin(): Plugin {
  let server: import('vite').ViteDevServer | undefined

  function emitVirtualModule(): string {
    const imageUrls = listClickToEnterAdPopupImageUrls()
    return `export const CLICK_TO_ENTER_AD_POPUP_IMAGE_URLS = ${JSON.stringify(imageUrls)};\n`
  }

  return {
    name: 'click-to-enter-ad-popup-images',
    resolveId(id) {
      if (id === adPopupVirtualModuleId) {
        return adPopupResolvedVirtualModuleId
      }
      return undefined
    },
    load(id) {
      if (id === adPopupResolvedVirtualModuleId) {
        return emitVirtualModule()
      }
      return undefined
    },
    configureServer(devServer) {
      server = devServer
      if (!fs.existsSync(adPopupDirectory)) {
        fs.mkdirSync(adPopupDirectory, { recursive: true })
      }
      fs.watch(adPopupDirectory, () => {
        const moduleNode = server?.moduleGraph.getModuleById(adPopupResolvedVirtualModuleId)
        if (moduleNode !== undefined) {
          server?.reloadModule(moduleNode)
        }
      })
    },
  }
}

const discordEmbedMetaPlaceholder = '<!-- discord-embed-meta -->'

function discordEmbedMetaPlugin(siteUrl: string): Plugin {
  return {
    name: 'discord-embed-meta',
    transformIndexHtml(html) {
      const normalizedSiteUrl = siteUrl.replace(/\/$/, '')
      if (normalizedSiteUrl.length === 0) {
        return html
      }

      const embedImageUrl = `${normalizedSiteUrl}/discord-embed.png`
      const metaTags = [
        `<meta property="og:url" content="${normalizedSiteUrl}/" />`,
        `<meta property="og:image" content="${embedImageUrl}" />`,
        `<meta property="og:image:type" content="image/png" />`,
        `<meta name="twitter:image" content="${embedImageUrl}" />`,
      ].join('\n    ')

      return html.replace(discordEmbedMetaPlaceholder, metaTags)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '')
  const siteUrl = env.VITE_SITE_URL ?? 'https://tabghacks.net'

  return {
    plugins: [svelte(), clickToEnterAdPopupImagesPlugin(), discordEmbedMetaPlugin(siteUrl)],
  }
})
