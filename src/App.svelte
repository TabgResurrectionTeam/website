<script lang="ts">
	import ClickToEnter from './ClickToEnter.svelte'
	import FakeAnubisChallenge from './FakeAnubisChallenge.svelte'
	import FakeCloudflareChallenge from './FakeCloudflareChallenge.svelte'
	import MainApp from './MainApp.svelte'

	const INTERSTITIAL_MS = 3000

	type PreGatePhase = 'anubis' | 'cloudflare' | 'gate'

	let preGatePhase = $state<PreGatePhase>('anubis')
	let hasEntered = $state(false)
	let song = $state<HTMLAudioElement | null>(null)

	$effect(() => {
		const toCloudflareId = window.setTimeout(() => {
			preGatePhase = 'cloudflare'
		}, INTERSTITIAL_MS)

		const toGateId = window.setTimeout(() => {
			preGatePhase = 'gate'
		}, INTERSTITIAL_MS * 2)

		return () => {
			window.clearTimeout(toCloudflareId)
			window.clearTimeout(toGateId)
		}
	})

	function handleEnter(): void {
		hasEntered = true
		void song?.play()
	}
</script>

{#if hasEntered}
	<MainApp />
{:else if preGatePhase === 'anubis'}
	<FakeAnubisChallenge />
{:else if preGatePhase === 'cloudflare'}
	<FakeCloudflareChallenge />
{:else}
	<ClickToEnter onenter={handleEnter} />
{/if}

<audio bind:this={song} src="/song.mp3" loop></audio>
