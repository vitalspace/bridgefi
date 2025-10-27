<script lang="ts">
	let amountFrom = $state('');
	let amountTo = $state('');
	let selectedToken = $state('sUSDC');
	let destAddress = $state('');
	let addressError = $state('');
	let showDetails = $state(false);
	let isLoading = $state(false);
	import { ArrowUpDown } from 'lucide-svelte';

	let orderId = $state<number | null>(null);
	let swapStatus = $state<'idle' | 'quoting' | 'creating' | 'pending' | 'completed' | 'failed'>(
		'idle'
	);
	let completedOrder = $state<any>(null);

	// Precios dinámicos desde el backend
	let tokenPrices = $state<Record<string, number>>({});
	let exchangeRates = $state<Record<string, number>>({});
	let lastPriceUpdate = $state<number>(0);
	let priceLoadError = $state<string>('');

	import Guardian from '$lib/components/ui/Guardian.svelte';
	import { apiServices } from '$lib/services/apiServices';
	import { createSwapOrder } from '$lib/services/contractService';
	import { walletStore } from '$lib/services/walletService';
	import { isAddress } from 'ethers';

	const chainNames: Record<string, string> = {
		ETN: 'electroneum-testnet',
		sUSDC: 'electroneum-testnet',
		sUSDT: 'electroneum-testnet',
		sBNB: 'electroneum-testnet',
		sETH: 'electroneum-testnet'
	};

	// Cargar precios al iniciar
	// $effect(() => {
	// 	loadPrices();
	// 	const interval = setInterval(loadPrices, 60000); // Cada 60 segundos
	// 	return () => clearInterval(interval);
	// });

	async function loadPrices() {
		try {
			const response = await apiServices.getPrices();
			if (response.success) {
				tokenPrices = response.prices;
				lastPriceUpdate = response.timestamp;
				priceLoadError = '';
				console.log('Prices loaded:', tokenPrices);
				calculateExchangeRates();
			} else {
				priceLoadError = 'Failed to load prices';
			}
		} catch (error) {
			console.error('Error loading prices:', error);
			priceLoadError = 'Error connecting to price service';
		}
	}

	function calculateExchangeRates() {
		if (!tokenPrices.STX) return;

		exchangeRates = {
			ETN: tokenPrices.STX / tokenPrices.ETN,
			sUSDC: tokenPrices.STX / tokenPrices.sUSDC,
			sUSDT: tokenPrices.STX / tokenPrices.sUSDT,
			sBNB: tokenPrices.STX / tokenPrices.sBNB,
			sETH: tokenPrices.STX / tokenPrices.sETH
		};
	}

	async function handleAmountChange() {
		if (amountFrom && !isNaN(parseFloat(amountFrom))) {
			try {
				swapStatus = 'quoting';

				const quote = await apiServices.getQuote('STX', selectedToken, parseFloat(amountFrom));

				if (quote.success) {
					amountTo = quote.quote.expectedAmount.toFixed(6);
					showDetails = true;
				}

				swapStatus = 'idle';
			} catch (error) {
				console.error('Error getting quote:', error);
				swapStatus = 'idle';
			}
		} else {
			amountTo = '';
			showDetails = false;
		}
	}

	function handleTokenChange() {
		handleAmountChange();
	}

	function setMaxAmount() {
		amountFrom = '100';
		handleAmountChange();
	}

	function swapTokens() {
		const temp = amountFrom;
		amountFrom = amountTo;
		amountTo = temp;
	}

	function validateAddress() {
		if (!destAddress.trim()) {
			addressError = '';
			return;
		}

		if (!isAddress(destAddress)) {
			addressError = 'Invalid Ethereum address format';
		} else {
			addressError = '';
		}
	}

	async function executeSwap() {
		if (
			!amountFrom ||
			!destAddress ||
			!$walletStore.isConnected ||
			!$walletStore.address ||
			addressError
		) {
			return;
		}

		try {
			isLoading = true;
			swapStatus = 'creating';

			const amountInMicroStx = Math.floor(parseFloat(amountFrom) * 1000000);
			const expectedAmountInMicroStx = Math.floor(parseFloat(amountTo) * 1000000);

			const txId = await createSwapOrder(
				amountInMicroStx,
				chainNames[selectedToken],
				destAddress,
				selectedToken,
				expectedAmountInMicroStx
			);

			console.log('Swap order created with txId:', txId);

			swapStatus = 'pending';

			// Wait 10 seconds before creating the backend order
			await new Promise((resolve) => setTimeout(resolve, 5000));

			let backendOrder = await apiServices.createSwapOrder({
				txId: txId
			});

			if (backendOrder.message === 'Transaction still pending, please try again in a few seconds') {
				console.log('Transaction pending, waiting 15 seconds...');
				await new Promise((resolve) => setTimeout(resolve, 15000));

				backendOrder = await apiServices.createSwapOrder({
					txId: txId
				});
			}

			if (backendOrder.success) {
				orderId = backendOrder.order.orderId;
				console.log('Order created with ID:', orderId);
				pollOrderStatus();
			} else {
				swapStatus = 'failed';
			}
		} catch (error) {
			console.error('Error executing swap:', error);
			swapStatus = 'failed';
		} finally {
			isLoading = false;
		}
	}

	async function pollOrderStatus() {
		if (!orderId) return;

		try {
			const response = await apiServices.pollOrderStatus(orderId);

			if (response.success) {
				swapStatus = response.status;

				if (response.status === 'completed') {
					console.log('Swap completed successfully!');
					completedOrder = response.order;
				} else if (response.status === 'pending') {
					setTimeout(pollOrderStatus, 5000);
				} else if (response.status === 'failed') {
					console.error('Swap failed:', response.order?.errorMessage);
				}
			}
		} catch (error) {
			console.error('Error polling order status:', error);
		}
	}

	function getUsdValue(amount: string, token: string): string {
		if (!amount || isNaN(parseFloat(amount)) || !tokenPrices[token]) return '0.00';
		const value = parseFloat(amount) * tokenPrices[token];
		return value.toFixed(2);
	}

	function getFeeAmount(): string {
		if (!amountTo || isNaN(parseFloat(amountTo))) return '--';
		const fee = parseFloat(amountTo) * 0.005;
		return fee.toFixed(6);
	}

	function getFinalAmount(): string {
		if (!amountTo || isNaN(parseFloat(amountTo))) return '--';
		const fee = parseFloat(amountTo) * 0.005;
		const final = parseFloat(amountTo) - fee;
		return final.toFixed(6);
	}
</script>

<Guardian>
	<div class="min-h-screen px-4 py-10 sm:px-10 sm:py-20 lg:px-40">
		<div class="mx-auto max-w-2xl">
			<!-- Page Title -->
			<div class="mb-8 text-center sm:mb-12">
				<h1
					class="mb-3 text-3xl font-black text-white drop-shadow-[0_4px_4px_rgba(168,85,247,0.5)] sm:text-4xl md:text-5xl"
				>
					Cross-Chain <span
						class="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
						>Swap</span
					>
				</h1>

				<p class="px-4 text-base font-bold text-gray-300 sm:text-lg">
					Exchange your STX tokens to EVM
				</p>
				{#if lastPriceUpdate}
					<p class="mt-2 text-xs text-gray-400">
						Prices updated: {new Date(lastPriceUpdate).toLocaleTimeString()}
					</p>
				{/if}
				{#if priceLoadError}
					<p class="mt-2 text-xs text-red-400">
						⚠️ {priceLoadError}
					</p>
				{/if}
			</div>

			<!-- Swap Card -->
			<div class="group relative">
				<!-- Shadow layer -->
				<div
					class="absolute inset-0 translate-x-2 translate-y-2 border-3 border-black bg-linear-to-br from-purple-600 to-cyan-600 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 sm:translate-x-3 sm:translate-y-3 sm:border-4 sm:group-hover:translate-x-4 sm:group-hover:translate-y-4"
				></div>

				<!-- Main card -->
				<div
					class="relative border-3 border-black bg-linear-to-br from-cyan-300 to-purple-400 p-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 sm:border-4 sm:p-6 md:p-8"
				>
					<!-- Decorative corners -->
					<div
						class="absolute top-2 right-2 h-6 w-6 rotate-45 border-3 border-black bg-amber-300 sm:top-4 sm:right-4 sm:h-8 sm:w-8 sm:border-4"
					></div>
					<div
						class="absolute bottom-2 left-2 h-4 w-4 -rotate-12 border-3 border-black bg-pink-400 sm:bottom-4 sm:left-4 sm:h-6 sm:w-6 sm:border-4"
					></div>

					<!-- Card Header -->
					<div class="relative z-10 mb-4 flex items-center justify-between sm:mb-6">
						<h2 class="text-xl font-black text-black sm:text-2xl">Swap</h2>
						<div
							class="flex items-center gap-2 border-3 border-black bg-white px-3 py-1 sm:border-4"
						>
							<span class="text-xs font-black text-black sm:text-sm">⚡ STX Testnet</span>
						</div>
					</div>

					<!-- From Input -->
					<div class="relative z-10 mb-3 sm:mb-4">
						<div class="group/input relative">
							<div
								class="absolute inset-0 translate-x-1.5 translate-y-1.5 border-3 border-black bg-purple-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
							></div>
							<div class="relative border-3 border-black bg-white p-3 sm:border-4 sm:p-4">
								<div class="mb-2 flex items-center justify-between">
									<span class="text-xs font-black text-black sm:text-sm">YOU SEND</span>
									<button
										onclick={() => setMaxAmount()}
										class="border-2 border-black bg-amber-300 px-2 py-1 text-xs font-black transition-colors hover:bg-amber-400 sm:px-3"
									>
										MAX
									</button>
								</div>
								<div class="flex items-center gap-2 sm:gap-3">
									<input
										type="number"
										bind:value={amountFrom}
										oninput={() => handleAmountChange()}
										class="w-full bg-transparent text-2xl font-black text-black placeholder-black/30 outline-none sm:text-3xl"
										placeholder="0.0"
									/>
									<div
										class="relative flex shrink-0 items-center justify-center gap-2 border-4 border-black bg-purple-400 px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:px-10 sm:py-2.5"
									>
										<span class="text-base font-black text-black sm:text-lg">STX</span>
									</div>
								</div>
								<p class="mt-2 text-xs font-bold text-black/70 sm:text-sm">
									~${getUsdValue(amountFrom, 'STX')} USD
								</p>
							</div>
						</div>
					</div>

					<!-- Swap Arrow Button -->
					<div class="relative z-10 my-2 flex justify-center">
						<button
							onclick={() => swapTokens()}
							class="group/arrow relative"
							aria-label="Intercambiar tokens"
						>
							<div
								class="absolute inset-0 translate-x-1 translate-y-1 rounded-full bg-black transition-transform group-hover/arrow:translate-x-2 group-hover/arrow:translate-y-2"
							></div>
							<div
								class="relative flex h-10 w-10 items-center justify-center rounded-full border-3 border-black bg-pink-400 transition-all group-hover/arrow:-translate-x-1 group-hover/arrow:-translate-y-1 group-hover/arrow:rotate-180 sm:h-12 sm:w-12 sm:border-4"
							>
								<ArrowUpDown class="h-5 w-5 text-black sm:h-6 sm:w-6" strokeWidth={3} />
							</div>
						</button>
					</div>

					<!-- To Input -->
					<div class="relative z-10 mb-3 sm:mb-4">
						<div class="group/input relative">
							<div
								class="absolute inset-0 translate-x-1.5 translate-y-1.5 border-3 border-black bg-cyan-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
							></div>
							<div class="relative border-3 border-black bg-white p-3 sm:border-4 sm:p-4">
								<div class="mb-2">
									<span class="text-xs font-black text-black sm:text-sm">YOU RECEIVE (EST.)</span>
								</div>
								<div class="flex items-center gap-2 sm:gap-3">
									<input
										type="number"
										bind:value={amountTo}
										readonly
										class="w-full bg-transparent text-2xl font-black text-black placeholder-black/30 outline-none sm:text-3xl"
										placeholder="0.0"
									/>
									<select
										bind:value={selectedToken}
										onchange={() => handleTokenChange()}
										class="relative shrink-0 cursor-pointer appearance-none border-4 border-black bg-cyan-400 px-3 py-3.5 pr-12 text-xs font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-cyan-500 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none sm:px-8 sm:py-3 sm:text-base"
										aria-label="Seleccionar token"
									>
										<option value="ETN">ETN</option>
										<option value="sUSDC">sUSDC</option>
										<option value="sUSDT">sUSDT</option>
										<option value="sBNB">sBNB</option>
										<option value="sETH">sETH</option>
									</select>
								</div>
								<p class="mt-2 text-xs font-bold text-black/70 sm:text-sm">
									~${getUsdValue(amountTo, selectedToken)} USD
								</p>
							</div>
						</div>
					</div>

					<!-- Destination Address -->
					<div class="relative z-10 mb-4 sm:mb-6">
						<div class="relative">
							<div
								class="absolute inset-0 translate-x-1.5 translate-y-1.5 border-3 border-black bg-black sm:translate-x-2 sm:translate-y-2 sm:border-4"
							></div>
							<div class="relative border-3 border-black bg-white p-3 sm:border-4 sm:p-4">
								<span class="mb-2 block text-xs font-black wrap-break-word text-black sm:text-sm">
									DESTINATION ADDRESS (ELECTRONEUM TESTNET)
								</span>
								<input
									type="text"
									bind:value={destAddress}
									oninput={validateAddress}
									class="w-full border-2 border-black bg-gray-100 px-2 py-2 font-mono text-sm font-bold text-black transition-colors outline-none focus:bg-white sm:px-3 sm:text-base"
									placeholder="0x..."
								/>
								<p class="mt-2 text-xs font-bold text-black/60">
									Enter your Electroneum wallet address
								</p>
								{#if addressError}
									<p class="mt-1 text-xs font-bold text-red-600">
										{addressError}
									</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- Swap Details -->
					{#if showDetails}
						<div class="relative z-10 mb-4 sm:mb-6">
							<div class="relative">
								<div
									class="absolute inset-0 translate-x-1.5 translate-y-1.5 border-3 border-black bg-amber-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
								></div>
								<div
									class="relative space-y-2 border-3 border-black bg-amber-300 p-3 sm:space-y-3 sm:border-4 sm:p-4"
								>
									<div class="flex items-center justify-between gap-2">
										<span class="text-xs font-bold text-black sm:text-sm">Rate</span>
										<span class="text-right text-xs font-black break-all text-black sm:text-sm"
											>1 STX = {exchangeRates[selectedToken]?.toFixed(6) || '--'}
											{selectedToken}</span
										>
									</div>
									<div class="h-0.5 bg-black sm:h-1"></div>
									<div class="flex items-center justify-between gap-2">
										<span class="text-xs font-bold text-black sm:text-sm">Network</span>
										<span class="text-xs font-black text-black sm:text-sm">Electroneum Testnet</span
										>
									</div>
									<div class="flex items-center justify-between gap-2">
										<span class="text-xs font-bold text-black sm:text-sm">Fee (0.5%)</span>
										<span class="text-right text-xs font-black break-all text-black sm:text-sm"
											>{getFeeAmount()} {selectedToken}</span
										>
									</div>
									<div class="flex items-center justify-between gap-2">
										<span class="text-xs font-bold text-black sm:text-sm">Estimated time</span>
										<span class="text-xs font-black text-black sm:text-sm">~5-10 min</span>
									</div>
									<div class="h-0.5 bg-black sm:h-1"></div>
									<div
										class="flex items-center justify-between gap-2 border-2 border-black bg-white p-2"
									>
										<span class="text-xs font-black text-black sm:text-sm">YOU WILL RECEIVE</span>
										<span class="text-right text-sm font-black break-all text-purple-600 sm:text-lg"
											>{getFinalAmount()} {selectedToken}</span
										>
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- Swap Button -->
					<div class="group/btn relative z-10">
						<div
							class="absolute inset-0 translate-x-2 translate-y-2 bg-black transition-transform group-hover/btn:translate-x-3 group-hover/btn:translate-y-3 sm:translate-x-3 sm:translate-y-3 sm:group-hover/btn:translate-x-4 sm:group-hover/btn:translate-y-4"
						></div>
						<button
							disabled={!amountFrom ||
								!destAddress ||
								!$walletStore.isConnected ||
								isLoading ||
								!!addressError}
							onclick={executeSwap}
							class="group/btn relative w-full cursor-pointer overflow-hidden border-3 border-black bg-white py-3 text-base font-black tracking-wider text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-[4px_4px_0px_0px_rgba(156,163,175,0.5)] disabled:hover:translate-x-0 disabled:hover:translate-y-0 sm:border-4 sm:py-4 sm:text-lg"
						>
							{#if !$walletStore.isConnected}
								CONNECT WALLET FIRST 🔌
							{:else if !amountFrom}
								ENTER AN AMOUNT 💰
							{:else if !destAddress}
								ENTER DESTINATION ADDRESS 📬
							{:else if addressError}
								INVALID ADDRESS FORMAT ❌
							{:else if isLoading}
								{#if swapStatus === 'quoting'}
									⏳ GETTING QUOTE...
								{:else if swapStatus === 'creating'}
									🔨 CREATING ORDER...
								{:else if swapStatus === 'pending'}
									⚡ PROCESSING SWAP...
								{:else}
									⏰ LOADING...
								{/if}
							{:else if swapStatus === 'completed'}
								✅ SWAP COMPLETED!
							{:else if swapStatus === 'failed'}
								❌ SWAP FAILED - TRY AGAIN
							{:else}
								⚡ EXECUTE SWAP →
							{/if}
						</button>
					</div>

					<!-- Transaction Links -->
					{#if completedOrder}
						<div class="relative z-10 mt-4 sm:mt-6">
							<div class="relative">
								<div
									class="absolute inset-0 translate-x-1.5 translate-y-1.5 border-3 border-black bg-green-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
								></div>
								<div
									class="relative space-y-3 border-3 border-black bg-green-300 p-3 sm:space-y-4 sm:border-4 sm:p-4"
								>
									<h3 class="text-sm font-black text-black sm:text-base">Transaction Links</h3>
									<div class="space-y-2">
										{#if completedOrder.externalTxHash}
											<div class="flex items-center justify-between">
												<span class="text-xs font-bold text-black sm:text-sm">STX Transaction:</span>
												<a
													href="https://explorer.hiro.so/txid/{completedOrder.externalTxHash}?chain=testnet"
													target="_blank"
													rel="noopener noreferrer"
													class="text-xs font-black text-blue-600 underline hover:text-blue-800 sm:text-sm"
												>
													View on Hiro Explorer
												</a>
											</div>
										{/if}
										{#if completedOrder.destinationTxHash}
											<div class="flex items-center justify-between">
												<span class="text-xs font-bold text-black sm:text-sm">Electroneum Transaction:</span>
												<a
													href="https://testnet-blockexplorer.electroneum.com/tx/{completedOrder.destinationTxHash}"
													target="_blank"
													rel="noopener noreferrer"
													class="text-xs font-black text-blue-600 underline hover:text-blue-800 sm:text-sm"
												>
													View on Electroneum Explorer
												</a>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Info Cards -->
			<div class="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3">
				<!-- Card 1 -->
				<div class="relative">
					<div
						class="absolute inset-0 translate-x-1.5 translate-y-1.5 border-3 border-black bg-purple-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
					></div>
					<div
						class="relative border-3 border-black bg-purple-400 p-3 text-center sm:border-4 sm:p-4"
					>
						<div class="mb-1 text-2xl sm:mb-2 sm:text-3xl">⚡</div>
						<p class="text-sm font-black text-black">Fast</p>
						<p class="text-xs font-bold text-black/70">10 - 60 seconds</p>
					</div>
				</div>

				<!-- Card 2 -->
				<div class="relative">
					<div
						class="absolute inset-0 translate-x-1.5 translate-y-1.5 border-3 border-black bg-cyan-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
					></div>
					<div
						class="relative border-3 border-black bg-cyan-400 p-3 text-center sm:border-4 sm:p-4"
					>
						<div class="mb-1 text-2xl sm:mb-2 sm:text-3xl">🔒</div>
						<p class="text-sm font-black text-black">Secure</p>
						<p class="text-xs font-bold text-black/70">Audited contracts</p>
					</div>
				</div>

				<!-- Card 3 -->
				<div class="relative">
					<div
						class="absolute inset-0 translate-x-1.5 translate-y-1.5 border-3 border-black bg-pink-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
					></div>
					<div
						class="relative border-3 border-black bg-pink-400 p-3 text-center sm:border-4 sm:p-4"
					>
						<div class="mb-1 text-2xl sm:mb-2 sm:text-3xl">💰</div>
						<p class="text-sm font-black text-black">Low fees</p>
						<p class="text-xs font-bold text-black/70">Only 0.5%</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</Guardian>
