<script lang="ts">
  export let title: string
</script>

<style>
  .container {
    width: 100%;
    height: 32px;
    padding: 4px 12px;
    contain: strict;
  }
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .title::before, .title::after {
    display: block;
    background-color: currentColor;
    flex: 1 1;
    height: 1px;
    content: '';
  }
  .title::before {
    margin-right: 1rem;
  }
  .title::after {
    margin-left: 1rem;
  }
</style>

<div on:click class="container">
  <div class="title">
    {title}
  </div>
</div>
