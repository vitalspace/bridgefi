<script lang="ts">
	import Guardian from '$lib/components/ui/Guardian.svelte';

	let activeTab = $state('overview');
</script>

<Guardian>
	<div class="min-h-screen px-4 py-10 sm:px-10 lg:px-20">
		<div
			class="mx-auto max-w-7xl
        "
		>
			<!-- Header -->
			<div class="mb-10 text-center">
				<h1
					class="mb-3 text-3xl font-black text-white drop-shadow-[0_4px_4px_rgba(168,85,247,0.5)] sm:text-4xl md:text-5xl"
				>
					BridgeFi <span
						class="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
						>Documentation</span
					>
				</h1>
				<p class="px-4 text-base font-bold text-gray-300 sm:text-lg">
					Complete guide to cross-chain swaps, credit scores, and lending
				</p>
			</div>

			<!-- Navigation Tabs -->
			<div class="mb-12 flex flex-wrap justify-center gap-3">
				{#each [{ id: 'overview', label: 'OVERVIEW' }, { id: 'swap', label: 'SWAP' }, { id: 'credit', label: 'CREDIT' }, { id: 'loans', label: 'LOANS' }] as tab}
					<button
						onclick={() => (activeTab = tab.id)}
						class="cursor-pointer group relative border-4 border-black px-6 py-3 font-black uppercase transition-all {activeTab ===
						tab.id
							? 'bg-cyan-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
							: 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1'}"
					>
						{tab.label}
					</button>
				{/each}
			</div>

			<!-- Content Sections -->
			<div class="space-y-8">
				<!-- Overview Tab -->
				{#if activeTab === 'overview'}
					<!-- What is BridgeFi -->
					<div class="group relative">
						<div
							class="absolute inset-0 translate-x-4 translate-y-4 border-4 border-black bg-purple-600"
						></div>
						<div
							class="relative border-4 border-black bg-gradient-to-br from-purple-300 to-purple-400 p-8 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
						>
							<h2 class="mb-6 text-3xl font-black text-black">What is BridgeFi?</h2>
							<p class="mb-6 text-base font-bold text-black/90">
								A decentralized finance platform combining three powerful features:
							</p>
							<div class="space-y-3">
								<div class="flex gap-4 border-l-4 border-black pl-4">
									<span class="text-2xl font-black text-black/50">1</span>
									<div>
										<p class="text-base font-black text-black">Cross-Chain Swaps</p>
										<p class="text-sm font-bold text-black/70">
											Exchange STX for EVM assets seamlessly
										</p>
									</div>
								</div>
								<div class="flex gap-4 border-l-4 border-black pl-4">
									<span class="text-2xl font-black text-black/50">2</span>
									<div>
										<p class="text-base font-black text-black">On-Chain Credit Scores</p>
										<p class="text-sm font-bold text-black/70">
											Earn scores based on your activity
										</p>
									</div>
								</div>
								<div class="flex gap-4 border-l-4 border-black pl-4">
									<span class="text-2xl font-black text-black/50">3</span>
									<div>
										<p class="text-base font-black text-black">Decentralized Lending</p>
										<p class="text-sm font-bold text-black/70">Access loans with fair rates</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Getting Started -->
					<div class="group relative">
						<div
							class="absolute inset-0 translate-x-4 translate-y-4 border-4 border-black bg-cyan-600"
						></div>
						<div
							class="relative border-4 border-black bg-gradient-to-br from-cyan-300 to-cyan-400 p-8 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
						>
							<h2 class="mb-6 text-3xl font-black text-black">Getting Started</h2>
							<div class="space-y-4">
								{#each ['Connect your wallet', 'Check your credit score', 'Start swapping or apply for loans'] as step, i}
									<div class="flex gap-4">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full border-3 border-black bg-white text-center"
										>
											<span class="font-black text-black">{i + 1}</span>
										</div>
										<div class="flex items-center">
											<p class="text-base font-bold text-black">{step}</p>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				<!-- Swap Tab -->
				{#if activeTab === 'swap'}
					<div class="group relative">
						<div
							class="absolute inset-0 translate-x-4 translate-y-4 border-4 border-black bg-green-600"
						></div>
						<div
							class="relative border-4 border-black bg-gradient-to-br from-green-300 to-emerald-400 p-8 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
						>
							<h2 class="mb-4 text-3xl font-black text-black">Cross-Chain Swaps</h2>
							<p class="mb-6 text-base font-bold text-black/90">
								Exchange STX tokens for EVM-compatible assets instantly and securely.
							</p>

							<div class="mb-8 grid gap-4 sm:grid-cols-3">
								<div class="border-3 border-black bg-white p-4">
									<p class="text-xl font-black text-black">⚡</p>
									<p class="mt-2 text-sm font-black text-black">Fast</p>
									<p class="text-xs font-bold text-black/70">10-60 seconds</p>
								</div>
								<div class="border-3 border-black bg-white p-4">
									<p class="text-xl font-black text-black">🔒</p>
									<p class="mt-2 text-sm font-black text-black">Secure</p>
									<p class="text-xs font-bold text-black/70">Audited contracts</p>
								</div>
								<div class="border-3 border-black bg-white p-4">
									<p class="text-xl font-black text-black">💰</p>
									<p class="mt-2 text-sm font-black text-black">Low fees</p>
									<p class="text-xs font-bold text-black/70">Only 0.5%</p>
								</div>
							</div>

							<div class="space-y-3">
								{#each [{ title: 'Step 1', desc: 'Enter the amount of STX to swap' }, { title: 'Step 2', desc: 'Select destination token (USDC)' }, { title: 'Step 3', desc: 'Review and confirm transaction' }, { title: 'Step 4', desc: 'Receive tokens in 60 seconds' }] as step}
									<div class="border-3 border-black bg-white p-4">
										<p class="text-sm font-black text-black">{step.title}</p>
										<p class="text-xs font-bold text-black/70">{step.desc}</p>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				<!-- Credit Tab -->
				{#if activeTab === 'credit'}
					<div class="group relative">
						<div
							class="absolute inset-0 translate-x-4 translate-y-4 border-4 border-black bg-yellow-600"
						></div>
						<div
							class="relative border-4 border-black bg-gradient-to-br from-yellow-300 to-amber-400 p-8 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
						>
							<h2 class="mb-6 text-3xl font-black text-black">Credit Score System</h2>
							<p class="mb-8 text-base font-bold text-black/90">
								Your score determines loan eligibility and rates. Range: 300-850
							</p>

							<div class="mb-8 grid gap-4 sm:grid-cols-3">
								<div
									class="border-4 border-black bg-gradient-to-br from-red-400 to-orange-400 p-6 text-center"
								>
									<p class="text-2xl font-black text-white">300-499</p>
									<p class="mt-2 text-base font-black text-white">Low</p>
									<p class="text-xs font-bold text-white/80">Basic access</p>
								</div>
								<div
									class="border-4 border-black bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 text-center"
								>
									<p class="text-2xl font-black text-black">500-699</p>
									<p class="mt-2 text-base font-black text-black">Medium</p>
									<p class="text-xs font-bold text-black/70">Good rates</p>
								</div>
								<div
									class="border-4 border-black bg-gradient-to-br from-green-400 to-emerald-400 p-6 text-center"
								>
									<p class="text-2xl font-black text-white">700-850</p>
									<p class="mt-2 text-base font-black text-white">High</p>
									<p class="text-xs font-bold text-white/80">Best terms</p>
								</div>
							</div>

							<div class="border-4 border-black bg-white p-6">
								<p class="mb-4 text-lg font-black text-black">What affects your score?</p>
								<ul class="space-y-3 text-sm font-bold text-black">
									<li class="flex gap-2">
										<span>📈</span>
										<span>Transaction history and volume</span>
									</li>
									<li class="flex gap-2">
										<span>✅</span>
										<span>Successful swaps completed</span>
									</li>
									<li class="flex gap-2">
										<span>⏰</span>
										<span>Account age and activity</span>
									</li>
									<li class="flex gap-2">
										<span>💳</span>
										<span>Loan repayment history</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				{/if}

				<!-- Loans Tab -->
				{#if activeTab === 'loans'}
					<div class="group relative">
						<div
							class="absolute inset-0 translate-x-4 translate-y-4 border-4 border-black bg-pink-600"
						></div>
						<div
							class="relative border-4 border-black bg-gradient-to-br from-pink-300 to-pink-400 p-8 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
						>
							<h2 class="mb-6 text-3xl font-black text-black">Decentralized Lending</h2>
							<p class="mb-8 text-base font-bold text-black/90">
								Borrow STX secured by collateral. Repay monthly with 10% annual interest.
							</p>

							<div class="mb-8 border-4 border-black bg-white p-6">
								<div class="grid gap-4 sm:grid-cols-3">
									<div>
										<p class="text-xs font-black text-black/70 uppercase">Interest Rate</p>
										<p class="text-2xl font-black text-black">10%</p>
										<p class="text-xs font-bold text-black/70">Annually</p>
									</div>
									<div>
										<p class="text-xs font-black text-black/70 uppercase">Collateral</p>
										<p class="text-2xl font-black text-black">150%</p>
										<p class="text-xs font-bold text-black/70">Of loan amount</p>
									</div>
									<div>
										<p class="text-xs font-black text-black/70 uppercase">Terms</p>
										<p class="text-2xl font-black text-black">1-36</p>
										<p class="text-xs font-bold text-black/70">Months</p>
									</div>
								</div>
							</div>

							<div class="mb-8">
								<p class="mb-4 text-lg font-black text-black">Available Limits by Score</p>
								<div class="grid gap-4 sm:grid-cols-3">
									<div
										class="border-4 border-black bg-gradient-to-br from-orange-300 to-red-300 p-6"
									>
										<p class="text-sm font-bold text-black/70">300-499</p>
										<p class="text-3xl font-black text-black">10 STX</p>
									</div>
									<div
										class="border-4 border-black bg-gradient-to-br from-yellow-300 to-amber-300 p-6"
									>
										<p class="text-sm font-bold text-black/70">500-699</p>
										<p class="text-3xl font-black text-black">25 STX</p>
									</div>
									<div
										class="border-4 border-black bg-gradient-to-br from-green-300 to-emerald-300 p-6"
									>
										<p class="text-sm font-bold text-black/70">700-850</p>
										<p class="text-3xl font-black text-black">50 STX</p>
									</div>
								</div>
							</div>

							<div class="border-4 border-black bg-white p-6">
								<p class="mb-4 text-lg font-black text-black">How to Borrow</p>
								<div class="space-y-3">
									{#each ['Check your credit score', 'Select loan amount & term', 'Lock collateral', 'Receive STX instantly', 'Make monthly payments'] as step, i}
										<div class="flex gap-3">
											<div
												class="flex h-8 w-8 items-center justify-center rounded border-2 border-black bg-pink-400 text-sm font-black text-black"
											>
												{i + 1}
											</div>
											<span class="pt-1 text-sm font-bold text-black">{step}</span>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<!-- <div class="mt-12 grid gap-4 sm:grid-cols-3">
                {#each [
                    { title: 'Support', desc: 'Discord Community', color: 'from-purple-300 to-purple-400' },
                    { title: 'Code', desc: 'GitHub Repo', color: 'from-cyan-300 to-cyan-400' },
                    { title: 'Status', desc: 'Testnet Active', color: 'from-pink-300 to-pink-400' }
                ] as item}
                    <div class="group relative">
                        <div
                            class="absolute inset-0 translate-x-3 translate-y-3 border-4 border-black bg-black/30"
                        ></div>
                        <div
                            class="relative border-4 border-black bg-gradient-to-br {item.color} p-6 text-center transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
                        >
                            <p class="text-lg font-black text-black">{item.title}</p>
                            <p class="text-sm font-bold text-black/70">{item.desc}</p>
                        </div>
                    </div>
                {/each}
            </div> -->
		</div>
	</div>
</Guardian>
