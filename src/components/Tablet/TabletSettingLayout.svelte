<script lang="ts">
  import { onMount } from 'svelte';
  import useSetting, { windowStyle, controlsStyle } from './useSetting'
  import useLayout, { LayoutType } from './useLayout'
  import { push } from 'svelte-spa-router'
  import TextButton from '../UI/TextButton.svelte'
  import SettingToggleButton from '../UI/SettingToggleButton.svelte'

  let container: HTMLElement
  let windowElement: HTMLElement
  let controlsElement: HTMLElement

  const { update } = useSetting()
  onMount(() => {
    const { init, setupHandler } = useLayout(container)
    init()
    setupHandler(windowElement, LayoutType.window)
    setupHandler(controlsElement, LayoutType.control)
  })
  const confirm = async () => {
    await update()
    close()
  }
  const close = () => {
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
    z-index: 5;
    display: flex;
    justify-content: center;
  }
  .window {
    z-index: 6;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .controls {
    z-index: 7;
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
  <div style="{$windowStyle}" class="window center" bind:this="{windowElement}"><span>Window</span></div>
  <div style="{$controlsStyle}" class="controls center" bind:this="{controlsElement}"><span>コントロール</span></div>
  <div class="confirm"><TextButton label="確定" on:click="{confirm}" /></div>
</div>
