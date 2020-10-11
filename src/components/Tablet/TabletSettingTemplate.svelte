<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { getStyleFromRect, ControlType, getControlKeyName } from './useSetting'
  import useTemplate, { controls, init } from './useTemplate'
  import TextButton from '../UI/TextButton.svelte'
  import { push } from 'svelte-spa-router'
  import SettingToggleButton from '../UI/SettingToggleButton.svelte'
  import useDB from '../../lib/useDB'
  import { store } from '../../store';

  let container
  let elements = {
    '0': null,
    '1': null,
    '2': null,
    '3': null,
    '4': null
  }

  const RATIO = 16 / 9

  const containerSize = {
    width: Math.min(Math.min(window.innerWidth, 800), Math.min((window.innerHeight - 160) * RATIO)),
    height: Math.min(Math.min(window.innerWidth / RATIO, 800 / RATIO), Math.min(window.innerHeight - 160))
  }
  init()

  const { init: initDB, addTemplate } = useDB()
  let addCon
  onMount(async () => {
    const prev = get(store.setting)
    if (!prev) {
      await initDB()
    }
    const { setupHandler, addControl } = useTemplate(container)
    addCon = addControl
    for (const type of Object.values(ControlType)) {
      if (elements[`${type}`] !== null) {
        setupHandler(elements[`${type}`], type)
      }
    }
  })
  const confirm = async () => {
    const newControl = addCon(containerSize.width, containerSize.height)
    await addTemplate(newControl)
    push('/client')
  }
</script>

<style>
  .container {
    position: relative;
    user-select: none;
    width: 100%;
    height: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .headerItem {
    background-color: rgba(0, 0, 0, 0.1);
    position: absolute;
    z-index: 10;
  }
  .controls {
    z-index: 7;
    position: absolute;
    top: 120px;
    left: 0;
    background-color: rgba(255, 0, 0, 0.5);
  }
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
  }
  .confirm {
    margin-top: auto;
    margin-bottom: 8rem;
    z-index: 999999;
  }
</style>

<div class="container" bind:this="{container}">
  <SettingToggleButton iconName="close" />
  {#each $controls as control}
    <div
      class="center headerItem"
      style="{getStyleFromRect(control.rect)}"
      bind:this="{elements[`${control.type}`]}"
    >
      <span>{getControlKeyName(control.type)}</span>
    </div>
  {/each}
  <div style="height: {containerSize.height}px; width: {containerSize.width}px" class="controls center"><span>コントロール</span></div>
  <div class="confirm"><TextButton on:click="{confirm}" on:touchstart="{confirm}" label="確定" /></div>
</div>
