<script>
  import Icon from './Icon.svelte'
  import { push } from 'svelte-spa-router'
  
  export let iconName
  export let openSetting = () => {}

  const toggle = (e) => {
    switch (iconName) {
      case 'cog': {
        if (openSetting) {
          openSetting(e)
        }
        return
      }
      case 'close': {
        push('/')
        return
      }
    }
  }
</script>

<style>
  .button {
    padding: 16px;
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: rgba(0, 0, 0, 0.2);
    cursor: pointer;
    z-index: 200;
  }
</style>

<div on:click="{toggle}" class="button">
  <Icon name="{iconName}" size="{48}" />
</div>
