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

  const { playVideo } = useWebRTC()
  onMount(async () => {
    const isIOS = /iPhone|iPod|iPad|Macintosh/i.test(navigator.userAgent)

    if (isIOS) {
      alert('iOS端末ではSafariでしか動かず、使用しないカメラのアクセスを要求します')
      await navigator.mediaDevices.getUserMedia({ video: true })
    }
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
  .dammy {
    width: 0;
    height: 0;
  }
</style>

<div class="container">
  {#if ws && !isTabletMode}
    {#each $controlStyles as controlStyle, i}
      {#if i === index}
        <TabletControl {ws} {controlStyle} on:trans="{trans}" />
      {/if}
    {/each}
  {/if}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this="{remoteVideo}" autoplay style="{$windowStyle}" class="window"></video>
  <!-- svelte-ignore a11y-media-has-caption -->
  <video src="/movie.mp4" class="dammy"></video>
  <TabletSetting />
</div>
