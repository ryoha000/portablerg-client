<script lang="ts">
  import { controlsStyle, ControlType } from './useSetting'
  import Panel from './Controls/Panel.svelte'
  import { createEventDispatcher } from 'svelte';
  import Icon from '../UI/Icon.svelte'

  export let controlStyle: {
    id: number
    controls: {
      type: ControlType
      style: string
    }[]
  }
  export let ws: WebSocket
  
  const dispatch = createEventDispatcher();
  const trans = (num: 1 | -1) => {
    console.log('trans')
    dispatch('trans', {
      num: num
    });
  }
</script>

<style>
  .container {
    position: absolute;
    user-select: none;
  }
  .controls {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .btnContainer {
    display: flex;
    position: absolute;
    top: 100%;
    width: 100%;
  }
  .button {
    padding: 16px;
  }
  .buttonRight {
    margin-left: auto;
  }
</style>

{#if controlStyle}
  <div class="container" style="{$controlsStyle}">
    <div class="controls">
      {#each controlStyle.controls as control}
        <Panel {ws} style="{control.style}" type="{control.type}" />
      {/each}
    </div>
    <div class="btnContainer">
      <div class="button" on:click="{() => trans(-1)}">
        <Icon name="chevron-left" size="{32}" />
      </div>
      <div class="button buttonRight" on:click="{() => trans(1)}">
        <Icon name="chevron-right" size="{32}" />
      </div>
    </div>
  </div>
{/if}
