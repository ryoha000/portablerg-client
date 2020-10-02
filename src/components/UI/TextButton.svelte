<script lang="ts">
  export let label: string
  export let color: string = 'rgb(0, 0, 0)'
</script>

<style>
  .container {
    padding: 0 1rem;
    height: 1.4rem;
    border: black solid 1px;
    border-radius: 0.7rem;
    cursor: pointer;
    font-weight: bold;
    margin-right: 16px;
  }
</style>

<div on:click class="container" style="color: {color}; border-color: {color};">
  {label}
</div>
