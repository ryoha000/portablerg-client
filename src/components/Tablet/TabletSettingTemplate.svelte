<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import useSetting, { getStyleFromRect, ControlType, getControlKeyName, setting } from './useSetting'
  import useTemplate, { controls, init } from './useTemplate'
  import TextButton from '../UI/TextButton.svelte'
  import { push } from 'svelte-spa-router'
  import SettingToggleButton from '../UI/SettingToggleButton.svelte'

  let container: HTMLElement
  let elements: any = {
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

  const { init: initSetting, update } = useSetting()
  let addCon: (width: number, height: number) => void
  onMount(async () => {
    const prev = get(setting)
    if (!prev) {
      await initSetting()
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
    addCon(containerSize.width, containerSize.height)
    await update()
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
  <div class="confirm"><TextButton on:click="{confirm}" label="確定" /></div>
</div>
