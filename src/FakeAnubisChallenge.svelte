<script lang="ts">
	const MASCOT_SRC = 'https://raw.githubusercontent.com/TecharoHQ/anubis/main/web/static/img/pensive.webp'

	let progressPercent = $state(0)
	let statusLine = $state('Calculating...')
	let speedKh = $state(0)

	const difficulty = 2

	$effect(() => {
		const startTime = performance.now()
		const durationMs = 3000
		let frameId = 0

		function tick(now: number): void {
			const elapsed = now - startTime
			const t = Math.min(1, elapsed / durationMs)
			progressPercent = Math.round((1 - Math.pow(1 - t, 2)) * 88)

			const fakeIters = Math.floor(t * 42000 + Math.sin(elapsed * 0.01) * 200)
			speedKh = fakeIters / Math.max(elapsed, 1)
			statusLine = `Calculating... Difficulty: ${difficulty}, Speed: ${speedKh.toFixed(3)}kH/s`

			if (t < 1) {
				frameId = requestAnimationFrame(tick)
			}
		}

		frameId = requestAnimationFrame(tick)

		return () => {
			cancelAnimationFrame(frameId)
		}
	})
</script>

<div class="anubis" role="status" aria-live="polite">
	<main class="anubis__main">
		<div class="anubis__centered">
			<h1 id="title">Making sure you're not a bot!</h1>
			<img
				id="image"
				class="anubis__mascot"
				src={MASCOT_SRC}
				alt=""
				width="280"
				height="280"
				decoding="async"
			/>
			<p id="status" class="anubis__status">{statusLine}</p>
			<div
				id="progress"
				class="anubis__progress"
				role="progressbar"
				aria-valuenow={progressPercent}
				aria-valuemin={0}
				aria-valuemax={100}
			>
				<div class="anubis__bar-inner" style:width="{progressPercent}%"></div>
			</div>
			<details class="anubis__details">
				<summary>Why am I seeing this?</summary>
				<p>
					This is a measure against bots and malicious requests similar to a CAPTCHA. Your browser
					is given a calculation task (proof of work). The task is calculated in a few seconds.
				</p>
			</details>
		</div>
	</main>
	<footer class="anubis__footer">
		<p>
			Protected by <strong>Anubis</strong> From <a href="https://techaro.lol" target="_blank" rel="noopener noreferrer">Techaro</a>.
			Made with ❤️ in 🇨🇦.
		</p>
		<p>Mascot design by <strong>CELPHASE</strong>.</p>
	</footer>
</div>

<style>
	.anubis {
		position: fixed;
		inset: 0;
		z-index: 1100;
		display: flex;
		flex-direction: column;
		background: #1d2021;
		color: #f9f5d7;
		font-family: Geist, system-ui, sans-serif;
	}

	.anubis__main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.anubis__centered {
		max-width: 36rem;
		text-align: center;
	}

	.anubis h1 {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(1.35rem, 4vw, 1.85rem);
		font-weight: 700;
		margin: 0 0 1rem;
	}

	.anubis__mascot {
		display: block;
		max-width: min(280px, 70vw);
		height: auto;
		margin: 0 auto 1rem;
	}

	.anubis__status {
		font-variant-numeric: tabular-nums;
		font-size: 0.95rem;
		margin: 0 0 1rem;
		line-height: 1.45;
	}

	.anubis__progress {
		width: min(20rem, 90%);
		height: 2rem;
		margin: 1rem auto 1.5rem;
		border-radius: 1rem;
		overflow: hidden;
		outline: #b16286 solid 4px;
		outline-offset: 2px;
		background: rgba(0, 0, 0, 0.25);
	}

	.anubis__bar-inner {
		height: 100%;
		background-color: #b16286;
		transition: width 0.2s ease-in;
	}

	.anubis__details {
		text-align: left;
		font-size: 0.85rem;
		color: #ebdbb2;
		margin-top: 0.5rem;
	}

	.anubis__details summary {
		cursor: pointer;
		color: #b16286;
		background: #282828;
		display: inline-block;
		padding: 0.15rem 0.35rem;
	}

	.anubis__details p {
		margin: 0.75rem 0 0;
		line-height: 1.5;
	}

	.anubis__footer {
		padding: 1rem 1.25rem 1.25rem;
		text-align: center;
		font-size: 0.78rem;
		line-height: 1.5;
		color: #d5c4a1;
	}

	.anubis__footer p {
		margin: 0.25rem 0;
	}

	.anubis a {
		color: #b16286;
		background: #282828;
		text-decoration: none;
	}

	.anubis a:hover {
		text-decoration: underline;
	}

	@media (prefers-reduced-motion: reduce) {
		.anubis__bar-inner {
			transition: none;
			width: 70% !important;
		}
	}
</style>
