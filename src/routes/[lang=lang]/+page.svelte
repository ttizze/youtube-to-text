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
			<button
				type="submit"
				class="tool-button fetch-button"
				disabled={loading}
				aria-label={loading ? t.fetchingButton : t.fetchButton}
				title={loading ? t.fetchingButton : t.fetchButton}
			>
				<span class="btn-icon" aria-hidden="true">
					<svg viewBox="0 0 24 24">
						<polygon points="8,6 18,12 8,18" />
						<line x1="5" y1="6" x2="5" y2="18" />
					</svg>
				</span>
				<span class="btn-label">{loading ? t.fetchingButton : t.fetchButton}</span>
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
							class="tool-button"
							class:active={viewMode === 'text'}
							onclick={() => (viewMode = 'text')}
							aria-label={t.viewModeText}
							title={t.viewModeText}
						>
							<span class="btn-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24">
									<line x1="4" y1="7" x2="20" y2="7" />
									<line x1="4" y1="12" x2="20" y2="12" />
									<line x1="4" y1="17" x2="14" y2="17" />
								</svg>
							</span>
							<span class="btn-label">{t.viewModeText}</span>
						</button>
						<button
							class="tool-button"
							class:active={viewMode === 'srt'}
							onclick={() => (viewMode = 'srt')}
							aria-label={t.viewModeSrt}
							title={t.viewModeSrt}
						>
							<span class="btn-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24">
									<path d="M7 4h10l3 3v13H7z" />
									<path d="M17 4v3h3" />
									<line x1="10" y1="12" x2="16" y2="12" />
									<line x1="10" y1="16" x2="15" y2="16" />
								</svg>
							</span>
							<span class="btn-label">{t.viewModeSrt}</span>
						</button>
					</div>
					<div class="actions">
						<button
							class="tool-button"
							onclick={copyToClipboard}
							aria-label={copied ? t.copiedButton : t.copyButton}
							title={copied ? t.copiedButton : t.copyButton}
						>
							<span class="btn-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24">
									<rect x="9" y="9" width="11" height="11" rx="2" />
									<rect x="4" y="4" width="11" height="11" rx="2" />
								</svg>
							</span>
							<span class="btn-label">{copied ? t.copiedButton : t.copyButton}</span>
						</button>
						<button
							class="tool-button"
							onclick={downloadFile}
							aria-label={viewMode === 'srt' ? t.downloadSrt : t.downloadText}
							title={viewMode === 'srt' ? t.downloadSrt : t.downloadText}
						>
							<span class="btn-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24">
									<line x1="12" y1="4" x2="12" y2="15" />
									<polyline points="7,11 12,16 17,11" />
									<line x1="5" y1="20" x2="19" y2="20" />
								</svg>
							</span>
							<span class="btn-label">{viewMode === 'srt' ? t.downloadSrt : t.downloadText}</span>
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

	.tool-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
	}

	.fetch-button {
		min-width: 8.75rem;
	}

	.btn-icon {
		display: inline-flex;
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.btn-icon svg {
		width: 100%;
		height: 100%;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
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

	@media (max-width: 640px) {
		.toolbar {
			padding: 0.5rem;
			gap: 0.5rem;
		}

		.tabs,
		.actions {
			gap: 0.4rem;
		}

		.tabs button,
		.actions button {
			min-width: 2.25rem;
			padding: 0.5rem;
		}

		.btn-label {
			display: none;
		}
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
