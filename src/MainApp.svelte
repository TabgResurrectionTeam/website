<svelte:head>
	<title>RehabG</title>
</svelte:head>

<script>
	import {onMount} from 'svelte';
	import {DOWNLOAD_BUTTON_IMAGE_URLS} from 'virtual:download-button-images';

	const fonts = [
		'Arial',
		'Courier New',
		'Georgia',
		'Impact',
		'Times New Roman',
		'Trebuchet MS',
		'Verdana',
		'Comic Sans MS',
		'Calibri',
		'Consolas',
		'Lucida Console',
		'Palatino Linotype',
		'Segoe UI',
		'Roboto',
		'Monaco',
		'Brush Script MT',
		'Copperplate',
		'Papyrus'
	];

	// for now, just gonna have the releases page. replace with actual file upload links b4 playtest
	const downloadLinks = [
		'https://github.com/TabgResurrectionTeam/website/releases', // dropbox
		'https://github.com/TabgResurrectionTeam/website/releases', // mega
		'https://github.com/TabgResurrectionTeam/website/releases', // google drive
		'https://github.com/TabgResurrectionTeam/website/releases', // icloud drive
		'https://github.com/TabgResurrectionTeam/website/releases', // mediafire
		'https://github.com/TabgResurrectionTeam/website/releases'  // filebin
	];

	let chosenFont = 'sans-serif';
	/** @type {{id: number, image: string, link: string, top: string, left: string, width: string}[]} */
	let downloadButtons = [];

	function chooseRandomFont() {
		chosenFont = fonts[Math.floor(Math.random() * fonts.length)];
	}

	onMount(() => {
		chooseRandomFont();
		const shuffledLinks = [...downloadLinks].sort(() => Math.random() - 0.5);
		const shuffledImages = [...DOWNLOAD_BUTTON_IMAGE_URLS].sort(() => Math.random() - 0.5);
		let nextButtonId = 6;

		downloadButtons = shuffledImages.length === 0 ? [] : Array.from({length: 6}, (_, index) => ({
			id: index,
			image: shuffledImages[index % shuffledImages.length],
			link: shuffledLinks[index],
			top: `${Math.random() * 100}%`,
			left: `${Math.random() * 100}%`,
			width: `${6 + Math.random() * 12}rem`
		}));

		/** @type {ReturnType<typeof setTimeout>} */
		let duplicateTimer;

		const scheduleDuplicate = () => {
			duplicateTimer = setTimeout(() => {
				if (downloadButtons.length > 0) {
					const sourceButton = downloadButtons[Math.floor(Math.random() * downloadButtons.length)];
					downloadButtons = [
						...downloadButtons,
						{
							...sourceButton,
							id: nextButtonId++,
							image: shuffledImages[Math.floor(Math.random() * shuffledImages.length)],
							top: `${Math.random() * 100}%`,
							left: `${Math.random() * 100}%`,
							width: `${6 + Math.random() * 12}rem`
						}
					];
				}

				scheduleDuplicate();
			}, 1000 + Math.random() * 2000);
		};

		scheduleDuplicate();

		return () => clearTimeout(duplicateTimer);
	});
</script>

<button class="title" type="button" style={`font-family: "${chosenFont}"`} onclick={chooseRandomFont}>
	<h1>RehabG</h1>
	<p>computery, penial, kolos, may, hackerman, landfall i guess</p>
</button>

<div class="download-buttons">
	{#each downloadButtons as button}
		<a
			class="download-button"
			href={button.link}
			style={`--button-top: ${button.top}; --button-left: ${button.left}; --button-width: ${button.width};`}
			aria-label={`Download ${button.id + 1}`}
		>
			<img src={button.image} alt="" />
		</a>
	{/each}
</div>

<style>
	.title {
		display: block;
		margin: 0 auto;
		border: 0;
		padding: 0;
		background: transparent;
		text-align: center;
		font-size: 4rem;
		cursor: pointer;
	}

	.title h1 {
		margin: 0;
	}

	.title p {
		margin: -0.25rem 0 0;
		font-size: 1rem;
	}

	.download-buttons {
		position: fixed;
		top: 12rem;
		right: 0;
		bottom: 0;
		left: 0;
		pointer-events: none;
	}

	.download-button {
		position: absolute;
		display: block;
		top: max(0px, min(var(--button-top), calc(100% - 9rem)));
		left: max(0px, min(var(--button-left), calc(100% - 18rem)));
		width: min(var(--button-width), calc(100vw - 1rem));
		max-height: 9rem;
		pointer-events: auto;
		transform-origin: center;
		transition: transform 0.2s ease, filter 0.2s ease;
	}

	.download-button:hover {
		transform: scale(1.05);
		filter: brightness(1.1);
	}

	.download-button img {
		display: block;
		width: 100%;
		max-height: 9rem;
		height: auto;
		object-fit: contain;
	}
</style>
