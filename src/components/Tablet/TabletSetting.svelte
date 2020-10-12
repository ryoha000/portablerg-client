<script>
  import { link } from 'svelte-spa-router'
  import { store } from '../../store'
  import SettingToggleButton from '../UI/SettingToggleButton.svelte'
  import { toggleTabletMode } from './useControl'

  let isOpenToggleSetting = false
  let isTabletMode = false
  store.isTabletMode.subscribe(v => isTabletMode = v)
  const stop = (e) => {
    e.stopPropagation()
  }
  const openToggleSetting = (e) => {
    isOpenToggleSetting = true
    stop(e)
  }
  const closeToggleSetting = (e) => {
    isOpenToggleSetting = false
    stop(e)
  }
</script>

<style>
  .layer {
    width: 100%;
    height: 100%;
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
  <div class="settingContainer" on:click="{stop}">
    <!-- svelte-ignore a11y-missing-attribute -->
    <a on:click="{toggleTabletMode}" on:touchstart="{toggleTabletMode}" class="settingItem">{isTabletMode ? 'タブレットモードを解除する' : 'タブレットモードにする'}</a>
    <a href="/setting/layout" class="settingItem" use:link>レイアウトの設定を開く</a>
    <a href="/setting/template" class="settingItem" use:link>コントロールのテンプレートを作る</a>
    <a href="/setting/sort" class="settingItem" use:link>コントロールのテンプレートを並び替える</a>
  </div>
{/if}
