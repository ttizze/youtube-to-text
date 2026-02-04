<script lang="ts">
	import { getTranslation, supportedLangs } from '$lib/i18n';
	import { page } from '$app/stores';

	let { children } = $props();

	const siteUrl = 'https://youtube-text.pages.dev';
	const ogImageUrl = `${siteUrl}/og-image.svg`;

	const lang = $derived($page.params.lang ?? 'en');
	const t = $derived(getTranslation(lang));

	const currentUrl = $derived(`${siteUrl}/${lang}`);
	const structuredData = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: t.siteName,
		description: t.siteDescription,
		url: currentUrl,
		inLanguage: lang,
		applicationCategory: 'UtilityApplication',
		operatingSystem: 'Any',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: lang === 'ja' ? 'JPY' : 'USD'
		}
	});

	const faqStructuredData = $derived({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: t.faq.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer
			}
		}))
	});
</script>

<svelte:head>
	<link rel="canonical" href={currentUrl} />

	<!-- hreflang tags -->
	{#each supportedLangs as hrefLang}
		<link rel="alternate" hreflang={hrefLang} href="{siteUrl}/{hrefLang}" />
	{/each}
	<link rel="alternate" hreflang="x-default" href="{siteUrl}/en" />

	<!-- Basic meta tags -->
	<meta name="description" content={t.siteDescription} />
	<meta name="keywords" content={t.keywords} />
	<meta name="robots" content="index, follow" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={t.siteName} />
	<meta property="og:description" content={t.siteDescription} />
	<meta property="og:site_name" content={t.siteName} />
	<meta property="og:locale" content={lang === 'ja' ? 'ja_JP' : 'en_US'} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={t.siteName} />
	<meta name="twitter:description" content={t.siteDescription} />
	<meta name="twitter:image" content={ogImageUrl} />

	<!-- Structured Data (JSON-LD) -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(faqStructuredData)}</script>`}
</svelte:head>

{@render children()}
