<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { store } from '../../store';
  import TabletOriginalLogin from "./TabletOriginalLogin.svelte"
  import Separator from '../UI/Separator.svelte';
  import LoginButton from '../UI/LoginButton.svelte'
  import useFirebase from './use/useFirebase'
  import { fullScreen } from '../../lib/utils'
  import useWebRTC from "../../lib/webRTC"

  let me: string | null
  let isConnect = false

  const { connectHost } = useWebRTC()
  const unsubscribe = store.me.subscribe(v => {
    me = v
    if (v) {
      console.log(v)
      connectHost(v)
    }
  })
  const { init, google, github } = useFirebase()
  onMount(() => init())
  onDestroy(unsubscribe)
  const loginGoogle = () => {
    fullScreen()
    google()
  }
  const loginGitHub = () => {
    fullScreen()
    github()
  }

  const stop = (e: MouseEvent) => {
    e.stopPropagation()
  }
</script>

<style>
  .container {
    position: absolute;
    user-select: none;
    width: 100%;
    height: 100%;
    z-index: 500;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(255, 255, 255);
  }
  .title {
    margin-bottom: 5rem;
  }
  .btnContainer {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: center;
    align-items: center;
    max-width: 500px;
  }
</style>

{#if !isConnect}
  <div class="container" on:click="{stop}">
    <h1 class="title">portablerg</h1>
    {#if !me}
      <div class="btnContainer">
        <LoginButton label="Sign up with Google" iconName="google" on:click="{loginGoogle}" />
        <LoginButton label="Sign up with GitHub" iconName="github" on:click="{loginGitHub}" />
        <Separator title="or" />
      </div>
      <TabletOriginalLogin />
    {:else}
      <LoginButton label="CONNECT" iconName="cast-connected" on:click="{() => connectHost(me)}" />
    {/if}
  </div>
{/if}
