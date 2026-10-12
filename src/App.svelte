<script lang="ts">
  import ClickToEnter from './ClickToEnter.svelte'
  import MainApp from './MainApp.svelte'

  let hasEntered = $state(false)
  let song = $state<HTMLAudioElement | null>(null)

  function handleEnter(): void {
    hasEntered = true
    void song?.play()
  }
</script>

{#if !hasEntered}
  <ClickToEnter onenter={handleEnter} />
{:else}
  <MainApp />
{/if}

<audio bind:this={song} src="/song.mp3" loop></audio>
