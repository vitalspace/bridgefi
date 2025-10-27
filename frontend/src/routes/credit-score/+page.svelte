<script lang="ts">
    import Guardian from '$lib/components/ui/Guardian.svelte';
    import { walletStore } from '$lib/services/walletService';

    // Estado para el credit score
    let creditScore = $state<number | null>(null);
    let isEligible = $state<boolean | null>(null);
    let isLoading = $state(false);
    let errorMessage = $state('');

    // Función para obtener el credit score desde la API
    async function checkCreditScore() {
        if (!$walletStore.isConnected || !$walletStore.address) {
            errorMessage = 'Please connect your wallet first.';
            return;
        }

        isLoading = true;
        errorMessage = '';

        try {
            const { apiServices } = await import('$lib/services/apiServices');
            const response = await apiServices.getCreditScore($walletStore.address);

            if (response.success !== false) {
                creditScore = response.score;
                isEligible = response.isEligible;
            } else {
                throw new Error('Failed to fetch credit score');
            }
        } catch (error) {
            console.error('Error fetching credit score:', error);
            errorMessage = 'Error fetching credit score. Please try again.';
        } finally {
            isLoading = false;
        }
    }

    // Función para resetear
    function resetScore() {
        creditScore = null;
        isEligible = null;
        errorMessage = '';
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
                    Credit <span
                        class="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                        >Score</span
                    >
                </h1>
                <p class="px-4 text-base font-bold text-gray-300 sm:text-lg">
                    Check your credit score and eligibility for loans
                </p>
            </div>

            <!-- Credit Score Card -->
            <div class="group relative mb-6">
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
                        <h2 class="text-xl font-black text-black sm:text-2xl">Your Credit Score</h2>
                        <div
                            class="flex items-center gap-2 border-3 border-black bg-white px-3 py-1 sm:border-4"
                        >
                            <span class="text-xs font-black text-black sm:text-sm">⚡ STX Testnet</span>
                        </div>
                    </div>

                    <!-- Score Display -->
                    <div class="relative z-10 mb-4 sm:mb-6">
                        <div class="border-3 border-black bg-white p-3 sm:border-4 sm:p-4">
                            <div class="mb-2">
                                <span class="text-xs font-black text-black sm:text-sm">CURRENT SCORE</span>
                            </div>
                            {#if creditScore !== null}
                                <div class="text-center">
                                    <div class="text-4xl font-black text-black sm:text-5xl md:text-6xl">
                                        {creditScore}
                                    </div>
                                    <p class="mt-2 text-sm font-bold text-black/70">
                                        {#if creditScore >= 800}
                                            Excellent
                                        {:else if creditScore >= 740}
                                            Good
                                        {:else if creditScore >= 670}
                                            Fair
                                        {:else if creditScore >= 580}
                                            Poor
                                        {:else}
                                            Very Poor
                                        {/if}
                                    </p>
                                </div>
                            {:else}
                                <div class="text-center">
                                    <div class="text-2xl font-black text-black/30 sm:text-3xl">
                                        --
                                    </div>
                                    <p class="mt-2 text-sm font-bold text-black/70">
                                        Click "Check Score" to view
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Eligibility Status -->
                    {#if isEligible !== null}
                        <div class="relative z-10 mb-4 sm:mb-6">
                            <div
                                class="border-3 border-black {isEligible ? 'bg-green-300' : 'bg-red-300'} p-3 sm:border-4 sm:p-4"
                            >
                                <div class="text-center">
                                    <div class="text-2xl font-black text-black sm:text-3xl">
                                        {#if isEligible}
                                            ✅ Eligible for Credit
                                        {:else}
                                            ❌ Not Eligible Yet
                                        {/if}
                                    </div>
                                    <p class="mt-2 text-xs font-bold text-black/70 sm:text-sm">
                                        {#if isEligible}
                                            Congratulations! You qualify for loans.
                                        {:else}
                                            Improve your score to unlock credit options.
                                        {/if}
                                    </p>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Error Message -->
                    {#if errorMessage}
                        <div class="relative z-10 mb-4 sm:mb-6">
                            <div class="border-3 border-black bg-red-300 p-3 sm:border-4 sm:p-4">
                                <p class="text-center text-sm font-bold text-black">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    {/if}

                    <!-- Action Buttons -->
                    <div class="relative z-10 flex gap-3 flex-col sm:flex-row sm:gap-4">
                        <button
                            onclick={checkCreditScore}
                            disabled={!$walletStore.isConnected || isLoading}
                            class="flex-1 cursor-pointer border-3 border-black bg-white py-3 text-base font-black tracking-wider text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-[4px_4px_0px_0px_rgba(156,163,175,0.5)] disabled:hover:translate-x-0 disabled:hover:translate-y-0 sm:border-4 sm:py-4 sm:text-lg"
                        >
                            {#if !$walletStore.isConnected}
                                CONNECT WALLET 🔌
                            {:else if isLoading}
                                ⏳ CHECKING...
                            {:else}
                                ⚡ CHECK SCORE
                            {/if}
                        </button>

                        {#if creditScore !== null}
                            <button
                                onclick={resetScore}
                                class="cursor-pointer border-3 border-black bg-pink-400 py-3 px-4 text-base font-black tracking-wider text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] sm:border-4 sm:py-4 sm:px-6 sm:text-lg"
                            >
                                RESET
                            </button>
                        {/if}

                        <!-- Request Loan Button -->
                        {#if isEligible}
                            <a
                                href="/request-loan"
                                class="flex-1 cursor-pointer border-3 border-black bg-gradient-to-r from-yellow-300 to-orange-300 py-3 px-4 text-base font-black tracking-wider text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] flex items-center justify-center sm:border-4 sm:py-4 sm:px-6 sm:text-lg"
                            >
                                💰 REQUEST LOAN
                            </a>
                        {/if}
                    </div>
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
                        <div class="mb-1 text-2xl sm:mb-2 sm:text-3xl">📊</div>
                        <p class="text-sm font-black text-black">Score Range</p>
                        <p class="text-xs font-bold text-black/70">300 - 850</p>
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
                        <p class="text-xs font-bold text-black/70">On-chain verified</p>
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
                        <p class="text-sm font-black text-black">Eligibility</p>
                        <p class="text-xs font-bold text-black/70">300+ for loans</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</Guardian>
