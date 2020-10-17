<script lang="ts">
  import { push } from 'svelte-spa-router'
  import { store } from '../../store'
  import SettingToggleButton from '../UI/SettingToggleButton.svelte'
  import { toggleTabletMode } from './useControl'
  import useWebRTC from '../../lib/webRTC'
  import { captureAndSave, sendDataMessage } from '../../lib/utils'
  import { get } from 'svelte/store';

  let isOpenToggleSetting = false
  let isTabletMode = false
  store.isTabletMode.subscribe(v => isTabletMode = v)
  const stop = (e: Event) => {
    e.stopPropagation()
  }
  const openToggleSetting = (e: Event) => {
    isOpenToggleSetting = true
    stop(e)
  }
  const closeToggleSetting = (e: Event) => {
    isOpenToggleSetting = false
    stop(e)
  }
  const { connectHost } = useWebRTC()
  const editMovie = () => {
    const dc: RTCDataChannel | null = get(store.dataChannel)
    if (dc) {
      sendDataMessage({ type: 'movie' }, dc)
    }
  }
</script>

<style>
  .layer {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 11;
    position: absolute;
  }
  .settingContainer {
    background-color: white;
    position: absolute;
    top: 2rem;
    right: 2rem;
    z-index: 999999;
    border: rgba(0, 0, 0, 0.7) solid 1px;
    display: flex;
    flex-direction: column;
  }
  .settingItem {
    border-bottom: rgba(0, 0, 0, 0.7) solid 1px;
    padding: 1rem;
    cursor: pointer;
  }
  .settingItem:last-of-type {
    border-bottom: 0;
  }
</style>

<SettingToggleButton iconName="cog" openSetting="{openToggleSetting}" />
{#if isOpenToggleSetting}
  <div class="layer" on:click="{closeToggleSetting}"></div>
  <div class="settingContainer" on:click="{closeToggleSetting}">
    <div on:click="{toggleTabletMode}" class="settingItem">{isTabletMode ? 'タブレットモードを解除する' : 'タブレットモードにする'}</div>
    <div on:click="{() => push('/setting/layout')}" class="settingItem">レイアウトの設定を開く</div>
    <div on:click="{() => push('/setting/template')}" class="settingItem">コントロールのテンプレートを作る</div>
    <div on:click="{() => push('/setting/sort')}" class="settingItem">コントロールのテンプレートを並び替える</div>
    <div on:click="{captureAndSave}" class="settingItem">スクリーンショットを保存する</div>
    <div on:click="{editMovie}" class="settingItem">動画を保存する</div>
    <div on:click="{connectHost}" class="settingItem">再接続する</div>
  </div>
{/if}
