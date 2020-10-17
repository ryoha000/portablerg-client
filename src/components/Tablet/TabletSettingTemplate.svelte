<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { getStyleFromControl, ControlType, getControlKeyName } from './useSetting'
  import useTemplate from './useTemplate'
  import TextButton from '../UI/TextButton.svelte'
  import { push } from 'svelte-spa-router'
  import SettingToggleButton from '../UI/SettingToggleButton.svelte'
  import TabletSettingTemplateAdd from './TabletSettingTemplateAdd.svelte'
  import TabletSettingTemplateColor from './TabletSettingTemplateColor.svelte'
  import useDB from '../../lib/useDB'
  import { store } from '../../store';

  type ControlTypeDict<T> = {
    [key in ControlType]: null | T;
  };

  let container: HTMLElement | null = null
  let borderElement: HTMLElement | null = null
  let elements: ControlTypeDict<HTMLElement> = {
    '0': null,
    '1': null,
    '2': null,
    '3': null,
    '4': null,
    '5': null
  }

  const RATIO = 16 / 9

  const containerSize = {
    width: Math.min(Math.min(window.innerWidth, 800), Math.min((window.innerHeight - 160) * RATIO)),
    height: Math.min(Math.min(window.innerWidth / RATIO, 800 / RATIO), Math.min(window.innerHeight - 160))
  }

  const { init: initTemplate, controls, setupHandler, addControl, changeColor } = useTemplate()  
  const { init: initDB, addTemplate } = useDB()
  onMount(async () => {
    const prev = get(store.setting)
    if (!prev) {
      await initDB()
    }
    if (!container) {
      console.error('container is not setted')
      return
    }
    initTemplate(container)
  })
  const addItem = (e: CustomEvent<{ type: ControlType }>) => {
    const type = e.detail.type
    const ele = elements[type]
    if (ele && borderElement) {
      setupHandler(ele, type, borderElement)
    }
  }
  const confirm = async () => {
    if (borderElement) {
      const newControl = addControl(borderElement)
      if (newControl) {
        await addTemplate(newControl)
        push('/client')
      }
    }
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
    top: 120px;
    left: 0;
    border: solid black 2px;
    flex-direction: column;
  }
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
  }
  .center.invisible {
    display: none;
  }
  .controlsContainer {
    padding: 5rem 0;
    width: 100%;
  }
  .confirm {
    margin-top: auto;
    margin-bottom: 8rem;
    z-index: 999999;
  }
</style>

<div class="container">
  <SettingToggleButton iconName="close" />
  <div>
    <TabletSettingTemplateAdd on:add="{addItem}" />
    <TabletSettingTemplateColor on:color="{(e) => changeColor(e.detail.rgba)}" />
  </div>
  <div class="controlsContainer center" bind:this="{container}">
    {#each Object.values(ControlType) as type}
      <div
        class="center headerItem invisible"
        style="{getStyleFromControl($controls[type])}"
        bind:this="{elements[type]}"
      >
        <span>{getControlKeyName(type)}</span>
      </div>
    {/each}
    <div
      style="height: {containerSize.height}px; width: {containerSize.width}px"
      class="controls center"
      bind:this="{borderElement}"
    >
      <div>コントロール</div>
      <div>枠内に使用したいアイテムを入れてください</div>
    </div>
  </div>
  <div class="confirm"><TextButton on:click="{confirm}" on:touchstart="{confirm}" label="確定" /></div>
</div>
