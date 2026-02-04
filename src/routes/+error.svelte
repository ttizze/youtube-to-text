<script lang="ts">
	import { page } from '$app/stores';
	import { supportedLangs } from '$lib/i18n';

	const status = $derived($page.status);
	const message = $derived($page.error?.message || 'Something went wrong');

	const errorMessages: Record<string, { title: string; description: string; home: string }> = {
		en: {
			title: 'Page Not Found',
			description: "The page you're looking for doesn't exist.",
			home: 'Go to Home'
		},
		ja: {
			title: 'ページが見つかりません',
			description: 'お探しのページは存在しません。',
			home: 'ホームへ戻る'
		},
		es: {
			title: 'Página no encontrada',
			description: 'La página que busca no existe.',
			home: 'Ir al inicio'
		},
		pt: {
			title: 'Página não encontrada',
			description: 'A página que você procura não existe.',
			home: 'Ir para o início'
		},
		ko: {
			title: '페이지를 찾을 수 없습니다',
			description: '찾으시는 페이지가 존재하지 않습니다.',
			home: '홈으로 이동'
		},
		zh: {
			title: '页面未找到',
			description: '您查找的页面不存在。',
			home: '返回首页'
		}
	};

	// Detect language from URL or default to 'en'
	const pathLang = $derived($page.url.pathname.split('/')[1]);
	const lang = $derived(supportedLangs.includes(pathLang) ? pathLang : 'en');
	const t = $derived(errorMessages[lang] || errorMessages['en']);
</script>

<svelte:head>
	<title>{status} - {t.title}</title>
</svelte:head>

<main>
	<div class="error-container">
		<h1>{status}</h1>
		<h2>{t.title}</h2>
		<p>{t.description}</p>
		<a href="/{lang}">{t.home}</a>
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #f5f5f5;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.error-container {
		text-align: center;
		padding: 2rem;
	}

	h1 {
		font-size: 6rem;
		color: #ff0000;
		margin: 0;
		line-height: 1;
	}

	h2 {
		font-size: 1.5rem;
		color: #333;
		margin: 1rem 0;
	}

	p {
		color: #666;
		margin-bottom: 2rem;
	}

	a {
		display: inline-block;
		padding: 0.75rem 2rem;
		background: #ff0000;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		transition: background 0.2s;
	}

	a:hover {
		background: #cc0000;
	}
</style>
