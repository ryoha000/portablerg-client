<script>
	import Router from 'svelte-spa-router'
	import Tablet from './components/Tablet/Tablet.svelte'
	import TabletSettingLayout from './components/Tablet/TabletSettingLayout.svelte'
	import TabletSettingSort from './components/Tablet/TabletSettingSort.svelte';
	import TabletSettingTemplate from './components/Tablet/TabletSettingTemplate.svelte';

	const routes = {
		'/': Tablet,
		'/setting/layout': TabletSettingLayout,
		'/setting/template': TabletSettingTemplate,
		'/setting/sort': TabletSettingSort,
	}
</script>

<main>
	<Router {routes} />
</main>

<style>
	main {
		margin: 0 auto;
		width: 100%;
		height: 100%;
	}
</style>
