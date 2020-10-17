<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let style: string = ''

  const dispatch = createEventDispatcher();
  const closeToggleSetting = (e: Event) => {
    e.stopPropagation()
    dispatch('close')
  }
</script>

<style>
  .layer {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 300;
    position: absolute;
  }
  .container {
    background-color: white;
    position: absolute;
    z-index: 999999;
    border: rgba(0, 0, 0, 0.7) solid 1px;
    display: flex;
    flex-direction: column;
  }
</style>


<div class="layer" on:click="{closeToggleSetting}"></div>
<div class="container" on:click="{closeToggleSetting}" style="{style}">
  <slot></slot>
</div>
