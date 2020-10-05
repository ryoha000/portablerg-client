<script lang="ts">
import Icon from "./Icon.svelte"

  export let label: string
  export let iconName: string
  export let color: string = 'rgb(0, 0, 0)'
</script>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }
  .icon {
    padding: 0.25rem;
  }
  .label {
    margin-left: 1.5rem;
    font-size: 1.2rem;
  }
</style>

<div on:click class="container">
  <div class="icon">
    <Icon name="{iconName}" size="{32}" />
  </div>
  <div class="label">
    {label}
  </div>
</div>
