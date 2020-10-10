<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import useSetting, { controlStyles, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'
  import { store } from '../../store';
  import TabletSetting from './TabletSetting.svelte'
  import { getNextIndex } from './useControl'
  import TabletLogin from './TabletLogin.svelte'
import { get } from 'svelte/store';

  let remoteVideo: HTMLMediaElement
  let ws: WebSocket
  let index = 0

  const {
    hangUp,
    setupWS,
    connectHost,
    sendMouseMove,
    playVideo
  } = useWebRTC()
  const { init } = useSetting()
  onMount(async () => {
    store.remoteVideoElement.set(remoteVideo)
    await init()
    ws = setupWS()
    // document.documentElement.requestFullscreen()
  })
  const trans = async (e: CustomEvent<{ num: 1 | -1}>) => {
    const next = getNextIndex(index, e.detail.num)
    index = next
  }

  const play = async () => {
    const ele: HTMLMediaElement = get(store.remoteVideoElement)
    const stream: MediaStream = get(store.remoteVideoStream)
    console.log(ele)
    console.log(stream)
    await playVideo(ele, stream)
  }
</script>

<style>
  .container {
    position: relative;
    user-select: none;
    width: 100%;
    height: 100%;
  }
  .window {
    z-index: -1;
  }
  .btnContainer {
    display: flex;
    position: absolute;
    z-index: 5;
  }
</style>

<TabletLogin />
<div class="container">
  <div class="btnContainer">
    <button type="button" on:click="{play}">Play</button>
    <button type="button" on:click="{() => hangUp(remoteVideo)}">Hang Up</button>
    <button type="button" on:click="{sendMouseMove}">sendMouseMove</button>
  </div>
  {#if ws}
  <!-- {#if ws && !isOpenToggleSetting} -->
    {#each $controlStyles as controlStyle, i}
      {#if i === index}
        <TabletControl {ws} {controlStyle} on:trans="{trans}" />
      {/if}
    {/each}
  {/if}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this="{remoteVideo}" autoplay style="{$windowStyle}" class="window"></video>
  <TabletSetting />
</div>
