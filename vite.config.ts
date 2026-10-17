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
const downloadButtonDirectory = path.join(projectRoot, 'public', 'buttons', 'download')
const downloadButtonVirtualModuleId = 'virtual:download-button-images'
const downloadButtonResolvedVirtualModuleId = '\0' + downloadButtonVirtualModuleId
const downloadButtonImagePattern = /\.(png|jpe?g|webp|gif|svg)$/i

function listClickToEnterAdPopupImageUrls(assetBase: string): string[] {
	if (!fs.existsSync(adPopupDirectory)) {
		return []
	}

	return fs
		.readdirSync(adPopupDirectory)
		.filter((fileName) => adPopupImagePattern.test(fileName))
		.sort((left, right) => left.localeCompare(right))
		.map((fileName) => `${assetBase}ad-popups/${fileName}`)
}

function clickToEnterAdPopupImagesPlugin(assetBase: string): Plugin {
	let server: import('vite').ViteDevServer | undefined

	function emitVirtualModule(): string {
		const imageUrls = listClickToEnterAdPopupImageUrls(assetBase)
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

function listDownloadButtonImageUrls(assetBase: string): string[] {
	if (!fs.existsSync(downloadButtonDirectory)) {
		return []
	}

	return fs
		.readdirSync(downloadButtonDirectory)
		.filter((fileName) => downloadButtonImagePattern.test(fileName))
		.sort((left, right) => left.localeCompare(right))
		.map((fileName) => `${assetBase}buttons/download/${fileName}`)
}

function downloadButtonImagesPlugin(assetBase: string): Plugin {
	let server: import('vite').ViteDevServer | undefined

	function emitVirtualModule(): string {
		const imageUrls = listDownloadButtonImageUrls(assetBase)
		return `export const DOWNLOAD_BUTTON_IMAGE_URLS = ${JSON.stringify(imageUrls)};\n`
	}

	return {
		name: 'download-button-images',
		resolveId(id) {
			if (id === downloadButtonVirtualModuleId) {
				return downloadButtonResolvedVirtualModuleId
			}
			return undefined
		},
		load(id) {
			if (id === downloadButtonResolvedVirtualModuleId) {
				return emitVirtualModule()
			}
			return undefined
		},
		configureServer(devServer) {
			server = devServer
			if (!fs.existsSync(downloadButtonDirectory)) {
				fs.mkdirSync(downloadButtonDirectory, { recursive: true })
			}
			fs.watch(downloadButtonDirectory, () => {
				const moduleNode = server?.moduleGraph.getModuleById(downloadButtonResolvedVirtualModuleId)
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

	const assetBase = './'

	return {
		base: assetBase,
		plugins: [
			svelte(),
			clickToEnterAdPopupImagesPlugin(assetBase),
			downloadButtonImagesPlugin(assetBase),
			discordEmbedMetaPlugin(siteUrl),
		],
	}
})
