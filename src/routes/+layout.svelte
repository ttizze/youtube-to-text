<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { env } from '$env/dynamic/public';

	let { children } = $props();

	const gscVerification =
		env.PUBLIC_GSC_VERIFICATION || 'iqpMNDdydvcOz9d4tVuIdD2vGbzHW2wgp5FmW2ISaH8';
	const gaMeasurementId = /^G-[A-Z0-9]+$/.test(env.PUBLIC_GA_MEASUREMENT_ID ?? '')
		? env.PUBLIC_GA_MEASUREMENT_ID
		: '';

	const trackPageView = () => {
		if (!browser || !gaMeasurementId) {
			return;
		}

		const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
		if (!gtag) {
			return;
		}

		gtag('event', 'page_view', {
			page_title: document.title,
			page_location: window.location.href,
			page_path: `${window.location.pathname}${window.location.search}`
		});
	};

	if (browser && gaMeasurementId) {
		afterNavigate(({ from }) => {
			// 初回表示は gtag('config') の自動 page_view を使う
			if (!from) {
				return;
			}
			trackPageView();
		});
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/favicon.svg" />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#FF0000" />
	{#if gaMeasurementId}
		<script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}></script>
		{@html `<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');
</script>`}
	{/if}
	{#if gscVerification}
		<meta name="google-site-verification" content={gscVerification} />
	{/if}
</svelte:head>

{@render children()}
