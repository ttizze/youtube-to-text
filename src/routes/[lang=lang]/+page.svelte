<script lang="ts">
	import { page } from '$app/stores';
	import { getTranslation, supportedLangs } from '$lib/i18n';

	const lang = $derived($page.params.lang ?? 'en');
	const t = $derived(getTranslation(lang));

	let url = $state('');
	let loading = $state(false);
	let error = $state('');
	let srt = $state('');
	let text = $state('');
	let videoId = $state('');
	let viewMode = $state<'text' | 'srt'>('text');
	let copied = $state(false);

	async function fetchTranscript() {
		if (!url.trim()) {
			error = t.errorUrlRequired;
			return;
		}

		loading = true;
		error = '';
		srt = '';
		text = '';
		videoId = '';

		try {
			const response = await fetch('/api/transcript', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: url.trim(), lang })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || t.errorFetchFailed;
				return;
			}

			srt = data.srt;
			text = data.text;
			videoId = data.videoId;
		} catch {
			error = t.errorFetchFailed;
		} finally {
			loading = false;
		}
	}

	function copyToClipboard() {
		const content = viewMode === 'srt' ? srt : text;
		navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function downloadFile() {
		const content = viewMode === 'srt' ? srt : text;
		const filename = viewMode === 'srt' ? `${videoId}.srt` : `${videoId}.txt`;
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		link.click();
	}
</script>

<svelte:head>
	<title>{t.pageTitle}</title>
</svelte:head>

<main>
	<div class="lang-switcher">
		{#each supportedLangs as switchLang}
			<a href="/{switchLang}" class:active={switchLang === lang}>
				{getTranslation(switchLang).langName}
			</a>
		{/each}
	</div>

	<h1>{t.pageTitle}</h1>
	<p class="description">{t.siteDescription}</p>

	<form onsubmit={(e) => { e.preventDefault(); fetchTranscript(); }}>
		<input
			type="text"
			bind:value={url}
			placeholder={t.urlPlaceholder}
			disabled={loading}
		/>
		<button type="submit" disabled={loading}>
			{loading ? t.fetchingButton : t.fetchButton}
		</button>
	</form>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	{#if text}
		<div class="result">
			<div class="toolbar">
				<div class="tabs">
					<button
						class:active={viewMode === 'text'}
						onclick={() => (viewMode = 'text')}
					>
						{t.viewModeText}
					</button>
					<button
						class:active={viewMode === 'srt'}
						onclick={() => (viewMode = 'srt')}
					>
						{t.viewModeSrt}
					</button>
				</div>
				<div class="actions">
					<button onclick={copyToClipboard}>
						{copied ? t.copiedButton : t.copyButton}
					</button>
					<button onclick={downloadFile}>
						{viewMode === 'srt' ? t.downloadSrt : t.downloadText}
					</button>
				</div>
			</div>
			<pre>{viewMode === 'srt' ? srt : text}</pre>
		</div>
	{/if}
</main>

<style>
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: #f5f5f5;
		margin: 0;
		padding: 0;
	}

	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.lang-switcher {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.lang-switcher a {
		color: #666;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.lang-switcher a:hover,
	.lang-switcher a.active {
		color: #ff0000;
	}

	h1 {
		color: #333;
		margin-bottom: 0.5rem;
	}

	.description {
		color: #666;
		margin-bottom: 2rem;
	}

	form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	input {
		flex: 1;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		outline: none;
		transition: border-color 0.2s;
	}

	input:focus {
		border-color: #ff0000;
	}

	button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		background: #ff0000;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover:not(:disabled) {
		background: #cc0000;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.error {
		background: #fee;
		color: #c00;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.result {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: #f9f9f9;
		border-bottom: 1px solid #eee;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
	}

	.tabs button {
		background: transparent;
		color: #666;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	.tabs button.active {
		background: #ff0000;
		color: white;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.actions button {
		background: #333;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	.actions button:hover {
		background: #555;
	}

	pre {
		margin: 0;
		padding: 1rem;
		white-space: pre-wrap;
		word-wrap: break-word;
		max-height: 500px;
		overflow-y: auto;
		font-size: 0.9rem;
		line-height: 1.6;
	}
</style>
