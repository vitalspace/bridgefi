<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { useWallet } from '$lib/hooks/useWallet';
	import { ChevronDown, Check, Copy, User, Settings, LogOut } from 'lucide-svelte';

	const { connectWallet, disconnectWallet, isConnected, address } = useWallet();

	let { children } = $props();
	let mobileMenuOpen = $state(false);
	let showDropdown = $state(false);
	let copied = $state(false);

	const ADMIN_ADDRESS = 'ST23JSMGR5933QJ329PKPNNQJV6QG8Z9D33QBYDNX';

	// Función para abreviar la dirección del wallet
	function truncateAddress(addr: string | null) {
		if (!addr) return '';
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
	}

	// Función para copiar la dirección con feedback visual
	async function copyAddress() {
		if ($address) {
			try {
				await navigator.clipboard.writeText($address);
				copied = true;
				setTimeout(() => {
					copied = false;
				}, 2000);
			} catch (err) {
				console.error('Failed to copy address:', err);
			}
		}
	}

	// Función para desconectar y cerrar el dropdown
	function handleDisconnect() {
		disconnectWallet();
		showDropdown = false;
		mobileMenuOpen = false;
	}

	// Función para navegar y cerrar dropdown
	function handleNavigation() {
		showDropdown = false;
		mobileMenuOpen = false;
	}

	// Verificar si es admin
	let isAdmin = $derived($address === ADMIN_ADDRESS);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Cambia aquí el tema: neutral-dark | slate-dark | emerald-dark | purple-dark | blue-dark | cyan-dark -->
<div class="theme-neutral-dark flex min-h-screen flex-col">
	<!-- Navbar -->
	<nav
		class="sticky top-0 z-50 border-b-4 border-black bg-orange-300 shadow-[0_4px_0px_0px_rgba(0,0,0,1)]"
	>
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<!-- Logo -->
				<div class="flex items-center gap-2">
					<div
						class="flex h-10 w-10 rotate-12 items-center justify-center border-4 border-black bg-purple-500 text-xl font-black text-white"
					>
						B
					</div>
					<a
						href="/"
						class="text-2xl font-black text-black [text-shadow:2px_2px_0px_rgba(251,191,36,0.4)]"
						>BridgeFi</a
					>
				</div>

				<!-- Desktop Menu -->
				<div class="hidden items-center gap-6 md:flex">
					<a
						href="/"
						class="transform font-black text-black transition-colors duration-200 hover:scale-105 hover:text-purple-600"
					>
						Home
					</a>
					<a
						href="/swap"
						class="transform font-black text-black transition-colors duration-200 hover:scale-105 hover:text-purple-600"
					>
						Swap
					</a>
					<a
						href="/credit-score"
						class="transform font-black text-black transition-colors duration-200 hover:scale-105 hover:text-purple-600"
					>
						Credit Score
					</a>
					<!-- <a
                        href="/request-loan"
                        class="transform font-black text-black transition-colors duration-200 hover:scale-105 hover:text-purple-600"
                    >
                        Loans
                    </a> -->
					<a
						href="/docs"
						class="transform font-black text-black transition-colors duration-200 hover:scale-105 hover:text-purple-600"
					>
						Docs
					</a>
				</div>

				<!-- Connect Wallet Button Desktop -->
				<div class="hidden md:block">
					{#if !$isConnected}
						<button
							onclick={connectWallet}
							class="border-4 border-black bg-purple-500 px-4 py-2 font-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
						>
							Connect Wallet
						</button>
					{:else}
						<div class="relative">
							<button
								onclick={() => (showDropdown = !showDropdown)}
								class="flex items-center gap-2 border-4 border-black bg-white px-4 py-2 font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
							>
								<div class="h-3 w-3 rounded-full border-2 border-black bg-purple-500"></div>
								<span class="truncate">{truncateAddress($address)}</span>
								<ChevronDown
									class="h-4 w-4 transition-transform"
									style="transform: {showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'}"
								/>
							</button>

							{#if showDropdown}
								<div
									class="absolute top-14 right-0 z-50 w-64 border-4 border-black bg-purple-400 p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
								>
									<!-- Wallet Info -->
									<div class="mb-3 border-4 border-black bg-white px-3 py-2">
										<p class="mb-2 text-xs font-black text-black">CONNECTED WALLET</p>
										<div class="flex items-center justify-between gap-2">
											<code class="text-sm font-bold text-black">{truncateAddress($address)}</code>
											<button
												onclick={copyAddress}
												class="border-2 border-black bg-cyan-300 p-1.5 transition-colors hover:bg-cyan-400"
												aria-label="Copy address"
												title={copied ? 'Copied!' : 'Copy address'}
											>
												{#if copied}
													<Check class="h-4 w-4 text-black" />
												{:else}
													<Copy class="h-4 w-4 text-black" />
												{/if}
											</button>
										</div>
										{#if copied}
											<p class="mt-1 text-xs font-bold text-purple-600">Address copied!</p>
										{/if}
										{#if isAdmin}
											<p class="mt-1 text-xs font-bold text-red-600">👑 Admin Account</p>
										{/if}
									</div>

									<div class="my-2 h-1 bg-black"></div>

									<!-- Navigation Links -->
									<a
										href="/profile"
										onclick={handleNavigation}
										class="mb-1 flex w-full items-center gap-3 border-2 border-transparent px-3 py-2 text-left text-sm font-black text-black transition-colors hover:border-black hover:bg-cyan-300"
									>
										<User class="h-4 w-4" />
										Profile
									</a>

									<a
										href="/settings"
										onclick={handleNavigation}
										class="mb-1 flex w-full items-center gap-3 border-2 border-transparent px-3 py-2 text-left text-sm font-black text-black transition-colors hover:border-black hover:bg-cyan-300"
									>
										<Settings class="h-4 w-4" />
										Settings
									</a>

									{#if isAdmin}
										<a
											href="/admin"
											onclick={handleNavigation}
											class="mb-1 flex w-full items-center gap-3 border-2 border-red-600 bg-red-300 px-3 py-2 text-left text-sm font-black text-black transition-colors hover:bg-red-400"
										>
											⚙️ Admin Panel
										</a>
									{/if}

									<div class="my-2 h-1 bg-black"></div>

									<button
										onclick={handleDisconnect}
										class="flex w-full items-center gap-3 border-2 border-black bg-pink-500 px-3 py-2 text-left text-sm font-black text-white transition-colors hover:bg-pink-600"
									>
										<LogOut class="h-4 w-4" />
										Disconnect
									</button>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Mobile menu button -->
				<button
					class="border-4 border-black bg-purple-500 p-2 md:hidden"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				>
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="3"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile Menu -->
		{#if mobileMenuOpen}
			<div class="border-t-4 border-black bg-purple-400 md:hidden">
				<div class="space-y-3 px-4 py-4">
					<a
						href="/"
						class="block border-b-4 border-black px-2 py-2 font-black text-black transition-colors hover:bg-purple-500 hover:text-white"
					>
						Home
					</a>
					<a
						href="/swap"
						class="block border-b-4 border-black px-2 py-2 font-black text-black transition-colors hover:bg-purple-500 hover:text-white"
					>
						Swap
					</a>
					<a
						href="/credit-score"
						class="block border-b-4 border-black px-2 py-2 font-black text-black transition-colors hover:bg-purple-500 hover:text-white"
					>
						Credit Score
					</a>
					<a
						href="/loans"
						class="block border-b-4 border-black px-2 py-2 font-black text-black transition-colors hover:bg-purple-500 hover:text-white"
					>
						Loans
					</a>
					<a
						href="/docs"
						class="block border-b-4 border-black px-2 py-2 font-black text-black transition-colors hover:bg-purple-500 hover:text-white"
					>
						Docs
					</a>

					<!-- Wallet Button Mobile -->
					{#if !$isConnected}
						<button
							onclick={connectWallet}
							class="w-full border-4 border-black bg-cyan-400 px-4 py-2 font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-cyan-500"
						>
							Connect Wallet
						</button>
					{:else}
						<div class="space-y-3">
							<!-- Wallet Info Mobile -->
							<div class="border-4 border-black bg-white px-4 py-3">
								<p class="mb-2 text-xs font-black text-black">CONNECTED WALLET</p>
								<div class="mb-2 flex items-center gap-2">
									<div class="h-3 w-3 rounded-full border-2 border-black bg-purple-500"></div>
									<code class="text-sm font-bold text-black">{truncateAddress($address)}</code>
								</div>
								{#if isAdmin}
									<p class="mb-2 text-xs font-bold text-red-600">👑 Admin Account</p>
								{/if}
								<button
									onclick={copyAddress}
									class="flex items-center gap-2 text-xs font-black text-purple-600 hover:text-purple-800"
								>
									{#if copied}
										<Check class="h-3 w-3" />
										Copied!
									{:else}
										<Copy class="h-3 w-3" />
										Copy Address
									{/if}
								</button>
							</div>

							<!-- Mobile Navigation Links -->
							<div class="space-y-2">
								<a
									href="/profile"
									onclick={handleNavigation}
									class="flex w-full items-center gap-3 border-4 border-black bg-cyan-300 px-4 py-2.5 text-sm font-black text-black hover:bg-cyan-400"
								>
									<User class="h-4 w-4" />
									Profile
								</a>

								<a
									href="/settings"
									onclick={handleNavigation}
									class="flex w-full items-center gap-3 border-4 border-black bg-cyan-300 px-4 py-2.5 text-sm font-black text-black hover:bg-cyan-400"
								>
									<Settings class="h-4 w-4" />
									Settings
								</a>

								{#if isAdmin}
									<a
										href="/admin"
										onclick={handleNavigation}
										class="flex w-full items-center gap-3 border-4 border-black bg-red-400 px-4 py-2.5 text-sm font-black text-white hover:bg-red-500"
									>
										⚙️ Admin Panel
									</a>
								{/if}
							</div>

							<button
								onclick={handleDisconnect}
								class="flex w-full items-center justify-center gap-2 border-4 border-black bg-pink-500 px-4 py-2.5 text-sm font-black text-white hover:bg-pink-600"
							>
								<LogOut class="h-4 w-4" />
								Disconnect Wallet
							</button>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</nav>

	<!-- Main Content -->
	<main class="flex-1">
		{@render children?.()}
	</main>

	<!-- Footer -->
	<footer class="relative mt-20 overflow-hidden border-t-4 border-black bg-orange-300">
		<!-- Decorative shapes in footer -->
		<div
			class="absolute top-4 right-10 h-20 w-20 rotate-12 border-4 border-black bg-purple-500 opacity-40"
		></div>
		<div
			class="absolute bottom-10 left-10 h-16 w-16 -rotate-12 border-4 border-black bg-amber-400 opacity-40"
		></div>

		<div class="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
				<!-- Brand Column -->
				<div class="space-y-4">
					<div class="flex items-center gap-2">
						<div
							class="flex h-12 w-12 rotate-12 items-center justify-center border-4 border-black bg-purple-500 text-2xl font-black text-white"
						>
							B
						</div>
						<span
							class="text-2xl font-black text-black [text-shadow:2px_2px_0px_rgba(251,191,36,0.4)]"
							>BridgeFi</span
						>
					</div>
					<p class="text-sm font-bold text-black">
						The future of DeFi is here. Cross-chain swaps and decentralized credit scores.
					</p>
					<!-- Social Links -->
					<div class="flex gap-3">
						<a
							href="#"
							class="flex h-10 w-10 items-center justify-center border-4 border-black bg-purple-500 transition-all duration-200 hover:rotate-12 hover:bg-purple-600"
						>
							<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
								/>
							</svg>
						</a>
						<a
							href="#"
							class="flex h-10 w-10 items-center justify-center border-4 border-black bg-amber-400 transition-all duration-200 hover:rotate-12 hover:bg-amber-500"
						>
							<svg class="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"
								/>
							</svg>
						</a>
						<a
							href="#"
							class="flex h-10 w-10 items-center justify-center border-4 border-black bg-white transition-all duration-200 hover:rotate-12 hover:bg-gray-100"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
								/>
							</svg>
						</a>
					</div>
				</div>

				<!-- Product Column -->
				<div class="space-y-4">
					<h3 class="text-xl font-black text-black [text-shadow:2px_2px_0px_rgba(168,85,247,0.4)]">
						Product
					</h3>
					<ul class="space-y-2">
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>Cross-Chain Swaps</a
							>
						</li>
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>Credit Score</a
							>
						</li>
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>Liquidity Pools</a
							>
						</li>
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>Staking</a
							>
						</li>
					</ul>
				</div>

				<!-- Developers Column -->
				<div class="space-y-4">
					<h3 class="text-xl font-black text-black [text-shadow:2px_2px_0px_rgba(168,85,247,0.4)]">
						Developers
					</h3>
					<ul class="space-y-2">
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>Documentation</a
							>
						</li>
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>API Reference</a
							>
						</li>
						<li>
							<a
								href="https://github.com/vitalspace/bridgefi"
								target="_blank"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>GitHub</a
							>
						</li>
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>Bug Bounty</a
							>
						</li>
					</ul>
				</div>

				<!-- Company Column -->
				<div class="space-y-4">
					<h3 class="text-xl font-black text-black [text-shadow:2px_2px_0px_rgba(168,85,247,0.4)]">
						Company
					</h3>
					<ul class="space-y-2">
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>About Us</a
							>
						</li>
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>Blog</a
							>
						</li>
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>Careers</a
							>
						</li>
						<li>
							<a
								href="#"
								class="inline-block font-bold text-black transition-all duration-200 hover:translate-x-1 hover:text-purple-600"
								>Contact</a
							>
						</li>
					</ul>
				</div>
			</div>

			<!-- Bottom Bar -->
			<div class="mt-12 border-t-4 border-black pt-8">
				<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
					<p class="text-sm font-black text-black">© 2025 BridgeFi. All rights reserved.</p>
					<div class="flex gap-6">
						<a
							href="#"
							class="text-sm font-bold text-black transition-colors hover:text-purple-600"
						>
							Privacy Policy
						</a>
						<a
							href="#"
							class="text-sm font-bold text-black transition-colors hover:text-purple-600"
						>
							Terms of Service
						</a>
						<a
							href="#"
							class="text-sm font-bold text-black transition-colors hover:text-purple-600"
						>
							Cookie Policy
						</a>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>

<!-- Dropdown Overlay -->
{#if showDropdown}
	<button
		onclick={() => (showDropdown = false)}
		class="fixed inset-0 z-40 cursor-default"
		aria-label="Close dropdown"
	></button>
{/if}

<style>
	/* Sistema de Temas */
	.theme-neutral-dark {
		background: linear-gradient(to bottom right, #0a0a0a, #171717, #0a0a0a);
	}

	.theme-slate-dark {
		background: linear-gradient(to bottom right, #111827, #1f2937, #111827);
	}

	.theme-emerald-dark {
		background: linear-gradient(to bottom right, #022c22, #064e3b, #022c22);
	}

	.theme-purple-dark {
		background: linear-gradient(to bottom right, #2e1065, #3b0764, #2e1065);
	}

	.theme-blue-dark {
		background: linear-gradient(to bottom right, #172554, #1e3a8a, #172554);
	}

	.theme-cyan-dark {
		background: linear-gradient(to bottom right, #083344, #164e63, #083344);
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
