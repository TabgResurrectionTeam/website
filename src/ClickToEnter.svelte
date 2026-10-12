<script lang="ts">
  interface Props {
    onenter: () => void
  }

  let { onenter }: Props = $props()
</script>

<button type="button" class="click-to-enter" onclick={onenter}>
  <span class="click-to-enter__label">CLICK TO ENTER</span>
</button>

<style>
  .click-to-enter {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: #000;
    color: #fff;
    font-family: system-ui, sans-serif;
    cursor: pointer;
    user-select: none;
  }

  .click-to-enter__label {
    font-size: clamp(1.25rem, 4vw, 2rem);
    font-weight: 600;
    letter-spacing: 0.35em;
    text-align: center;
  }
</style>
