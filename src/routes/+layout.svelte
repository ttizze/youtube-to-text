<script lang="ts">
	import { PUBLIC_GSC_VERIFICATION } from '$env/static/public';

	let { children } = $props();

	const gscVerification =
		PUBLIC_GSC_VERIFICATION || 'iqpMNDdydvcOz9d4tVuIdD2vGbzHW2wgp5FmW2ISaH8';
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/favicon.svg" />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#FF0000" />
	{#if gscVerification}
		<meta name="google-site-verification" content={gscVerification} />
	{/if}
</svelte:head>

{@render children()}
