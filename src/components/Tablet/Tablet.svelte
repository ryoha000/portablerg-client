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
  let paused

  const {
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
</style>

<div class="container">
  {#if ws && !isTabletMode}
  <!-- {#if ws && !isOpenToggleSetting} -->
    {#each $controlStyles as controlStyle, i}
      {#if i === index}
        <TabletControl {ws} {controlStyle} on:trans="{trans}" />
      {/if}
    {/each}
  {/if}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this="{remoteVideo}" bind:paused="{paused}" playsinline autoplay controls style="{$windowStyle}" class="window"></video>
  <div>paused: {paused}</div>
  <TabletSetting />
</div>
