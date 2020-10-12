<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import { controlStyles, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'
  import { store } from '../../store';
  import TabletSetting from './TabletSetting.svelte'
  import { getNextIndex } from './useControl'
  import { get } from 'svelte/store';

  let remoteVideo: HTMLMediaElement
  let ws: WebSocket
  let isTabletMode = false
  store.isTabletMode.subscribe(v => isTabletMode = v)
  let index = 0

  const {
    hangUp,
    sendMouseMove,
    playVideo
  } = useWebRTC()
  onMount(async () => {
    store.remoteVideoElement.set(remoteVideo)
    const remoteVideoStream: MediaStream | null = get(store.remoteVideoStream)
    if (remoteVideoStream) {
      playVideo(remoteVideo, remoteVideoStream)
    }
    ws = get(store.ws)
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
    playVideo(ele, stream)
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

<div class="container">
  <div class="btnContainer">
    <button type="button" on:click="{play}">Play</button>
    <button type="button" on:click="{() => hangUp(remoteVideo)}">Hang Up</button>
    <button type="button" on:click="{sendMouseMove}">sendMouseMove</button>
  </div>
  {#if ws && !isTabletMode}
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
