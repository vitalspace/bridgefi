<script lang="ts">
    import Guardian from '$lib/components/ui/Guardian.svelte';
    import { walletStore } from '$lib/services/walletService';


    const CONTRACT_OWNER = 'ST23JSMGR5933QJ329PKPNNQJV6QG8Z9D33QBYDNX';
    let isOwner = $derived($walletStore.isConnected && $walletStore.address === CONTRACT_OWNER);


    let contractBalance = $state<number>(0);
    let availableLiquidity = $state<number>(0);
    let totalLoans = $state<number>(0);
    let totalFees = $state<number>(0);
    let isLoading = $state(false);
    let addLiquidityAmount = $state<number>(0);
    let withdrawAmount = $state<number>(0);
    let withdrawLiquidityAmount = $state<number>(0);
    let userAddress = $state('');
    let userScore = $state<number>(0);
    let isAddingLiquidity = $state(false);
    let isWithdrawing = $state(false);
    let isWithdrawingLiquidity = $state(false);
    let isUpdatingScore = $state(false);
    let errorMessage = $state('');
    let successMessage = $state('');


    async function loadContractStats() {
        if (!$walletStore.isConnected || !isOwner) return;


        isLoading = true;
        try {
            const { getContractBalance, getAvailableLiquidity, getContractStats } = await import('$lib/services/loanService');


            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));


            const balance = await getContractBalance();
            contractBalance = balance / 1000000; // Convertir a STX


            await new Promise(resolve => setTimeout(resolve, 1000));


            const liquidity = await getAvailableLiquidity();
            availableLiquidity = liquidity / 1000000; // Convertir a STX


            await new Promise(resolve => setTimeout(resolve, 1000));


            const stats = await getContractStats();
            totalLoans = stats.totalLoans;
            totalFees = stats.totalFees / 1000000; // Convertir a STX
        } catch (error) {
            console.error('Error loading contract stats:', error);
            // Set default values on error
            contractBalance = 0;
            availableLiquidity = 0;
            totalLoans = 0;
            totalFees = 0;
        } finally {
            isLoading = false;
        }
    }


    async function addLiquidity() {
        if (!$walletStore.isConnected || addLiquidityAmount <= 0) {
            errorMessage = 'Please connect wallet and enter valid amount';
            return;
        }


        isAddingLiquidity = true;
        errorMessage = '';
        successMessage = '';


        try {
            const { addLiquidity } = await import('$lib/services/loanService');
            const amountMicroStx = Math.floor(addLiquidityAmount * 1000000);
            const txId = await addLiquidity(amountMicroStx);


            successMessage = `Liquidity added successfully! Transaction: ${txId}`;
            addLiquidityAmount = 0;


            // Wait a bit for transaction to be mined, then reload stats
            setTimeout(() => {
                loadContractStats();
            }, 10000); // Wait 10 seconds
        } catch (error) {
            console.error('Error adding liquidity:', error);
            errorMessage = error instanceof Error ? error.message : 'Failed to add liquidity';
        } finally {
            isAddingLiquidity = false;
        }
    }


    async function withdrawFees() {
        if (!$walletStore.isConnected || withdrawAmount <= 0) {
            errorMessage = 'Please connect wallet and enter valid amount';
            return;
        }


        isWithdrawing = true;
        errorMessage = '';
        successMessage = '';


        try {
            const { withdrawFees } = await import('$lib/services/loanService');
            const amountMicroStx = Math.floor(withdrawAmount * 1000000);
            const txId = await withdrawFees(amountMicroStx);


            successMessage = `Fees withdrawn successfully! Transaction: ${txId}`;
            withdrawAmount = 0;
            loadContractStats();
        } catch (error) {
            console.error('Error withdrawing fees:', error);
            errorMessage = error instanceof Error ? error.message : 'Failed to withdraw fees';
        } finally {
            isWithdrawing = false;
        }
    }


    // NEW: Withdraw liquidity
    async function withdrawLiquidity() {
        if (!$walletStore.isConnected || withdrawLiquidityAmount <= 0) {
            errorMessage = 'Please connect wallet and enter valid amount';
            return;
        }


        if (withdrawLiquidityAmount > availableLiquidity) {
            errorMessage = `Cannot withdraw more than available liquidity (${availableLiquidity.toFixed(2)} STX)`;
            return;
        }


        isWithdrawingLiquidity = true;
        errorMessage = '';
        successMessage = '';


        try {
            const { withdrawLiquidity } = await import('$lib/services/loanService');
            const amountMicroStx = Math.floor(withdrawLiquidityAmount * 1000000);
            const txId = await withdrawLiquidity(amountMicroStx);


            successMessage = `Liquidity withdrawn successfully! Transaction: ${txId}`;
            withdrawLiquidityAmount = 0;


            // Wait a bit for transaction to be mined, then reload stats
            setTimeout(() => {
                loadContractStats();
            }, 10000); // Wait 10 seconds
        } catch (error) {
            console.error('Error withdrawing liquidity:', error);
            errorMessage = error instanceof Error ? error.message : 'Failed to withdraw liquidity';
        } finally {
            isWithdrawingLiquidity = false;
        }
    }


    async function updateUserScore() {
        if (!$walletStore.isConnected || !userAddress || userScore < 300 || userScore > 850) {
            errorMessage = 'Please connect wallet, enter valid address and score (300-850)';
            return;
        }


        isUpdatingScore = true;
        errorMessage = '';
        successMessage = '';


        try {
            const { updateUserScore } = await import('$lib/services/loanService');
            const txId = await updateUserScore(userAddress, userScore);


            successMessage = `User score updated successfully! Transaction: ${txId}`;
            userAddress = '';
            userScore = 0;
        } catch (error) {
            console.error('Error updating user score:', error);
            errorMessage = error instanceof Error ? error.message : 'Failed to update user score';
        } finally {
            isUpdatingScore = false;
        }
    }


    $effect(() => {
        if ($walletStore.isConnected) {
            loadContractStats();
        }
    });
</script>


<Guardian>
    <div class="min-h-screen px-4 py-10 sm:px-10 lg:px-20">
        <div class="mx-auto max-w-7xl">
            <!-- Header -->
            <div class="mb-10 text-center">
      <h1 class="mb-3 text-3xl font-black text-white drop-shadow-[0_4px_4px_rgba(168,85,247,0.5)] sm:text-4xl md:text-5xl">
    Admin <span class="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Panel</span>
</h1>
                <p class="text-base text-gray-300">
                    Manage lending system liquidity and user scores
                </p>
            </div>


            {#if !isOwner}
                <!-- Access Denied -->
                <div class="group relative mx-auto max-w-2xl">
                    <div class="absolute inset-0 translate-x-3 translate-y-3 border-4 border-black bg-red-500"></div>
                    <div class="relative border-4 border-black bg-gradient-to-br from-red-300 to-pink-400 p-10 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                        <div class="text-center">
                            <h3 class="mb-3 text-2xl font-black text-black">Access Denied</h3>
                            <p class="mb-4 text-base font-bold text-black/80">
                                This panel is restricted to contract administrators only.
                            </p>
                            {#if !$walletStore.isConnected}
                                <p class="text-sm font-bold text-black/60">Connect your wallet to continue</p>
                            {:else}
                                <p class="text-sm font-mono font-bold text-black/60">
                                    {$walletStore.address?.slice(0, 10)}...{$walletStore.address?.slice(-6)}
                                </p>
                            {/if}
                        </div>
                    </div>
                </div>
            {:else}
                <!-- Messages -->
                {#if errorMessage}
                    <div class="group relative mb-6">
                        <div class="absolute inset-0 translate-x-2 translate-y-2 border-3 border-black bg-red-500"></div>
                        <div class="relative border-3 border-black bg-red-400 p-4 text-sm font-bold text-black transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                            {errorMessage}
                        </div>
                    </div>
                {/if}


                {#if successMessage}
                    <div class="group relative mb-6">
                        <div class="absolute inset-0 translate-x-2 translate-y-2 border-3 border-black bg-green-500"></div>
                        <div class="relative border-3 border-black bg-green-400 p-4 text-sm font-bold text-black transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                            {successMessage}
                        </div>
                    </div>
                {/if}


                <!-- Stats Grid -->
                <div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <!-- Total Balance -->
                    <div class="group relative">
                        <div class="absolute inset-0 translate-x-3 translate-y-3 border-4 border-black bg-purple-600"></div>
                        <div class="relative border-4 border-black bg-gradient-to-br from-purple-300 to-purple-400 p-5 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                            <div class="mb-2 text-xs font-black uppercase tracking-wide text-purple-900">Total Balance</div>
                            <div class="text-3xl font-black text-black">{contractBalance.toFixed(2)}</div>
                            <div class="mt-1 text-xs font-bold text-black/70">STX</div>
                        </div>
                    </div>


                    <!-- Available Liquidity -->
                    <div class="group relative">
                        <div class="absolute inset-0 translate-x-3 translate-y-3 border-4 border-black bg-cyan-600"></div>
                        <div class="relative border-4 border-black bg-gradient-to-br from-cyan-300 to-cyan-400 p-5 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                            <div class="mb-2 text-xs font-black uppercase tracking-wide text-cyan-900">Available Liquidity</div>
                            <div class="text-3xl font-black text-black">{availableLiquidity.toFixed(2)}</div>
                            <div class="mt-1 text-xs font-bold text-black/70">STX</div>
                        </div>
                    </div>


                    <!-- Total Loans -->
                    <div class="group relative">
                        <div class="absolute inset-0 translate-x-3 translate-y-3 border-4 border-black bg-pink-600"></div>
                        <div class="relative border-4 border-black bg-gradient-to-br from-pink-300 to-pink-400 p-5 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                            <div class="mb-2 text-xs font-black uppercase tracking-wide text-pink-900">Total Loans</div>
                            <div class="text-3xl font-black text-black">{totalLoans}</div>
                            <div class="mt-1 text-xs font-bold text-black/70">Issued</div>
                        </div>
                    </div>


                    <!-- Fees Collected -->
                    <div class="group relative">
                        <div class="absolute inset-0 translate-x-3 translate-y-3 border-4 border-black bg-yellow-600"></div>
                        <div class="relative border-4 border-black bg-gradient-to-br from-yellow-300 to-yellow-400 p-5 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                            <div class="mb-2 text-xs font-black uppercase tracking-wide text-yellow-900">Fees Collected</div>
                            <div class="text-3xl font-black text-black">{totalFees.toFixed(2)}</div>
                            <div class="mt-1 text-xs font-bold text-black/70">STX</div>
                        </div>
                    </div>
                </div>


                <!-- Refresh Button -->
                <div class="group relative mb-8">
                    <div class="absolute inset-0 translate-x-2 translate-y-2 border-3 border-black bg-gray-700"></div>
                    <button
                        onclick={loadContractStats}
                        disabled={isLoading || !$walletStore.isConnected}
                        class="relative w-full border-3 border-black bg-white p-3 text-sm font-black text-black transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? 'Refreshing...' : 'Refresh Stats'}
                    </button>
                </div>


                <!-- Actions Grid - 3 Columns -->
                <div class="mb-8 grid gap-6 lg:grid-cols-3">
                    <!-- Add Liquidity -->
                    <div class="group relative">
                        <div class="absolute inset-0 translate-x-4 translate-y-4 border-4 border-black bg-green-600"></div>
                        <div class="relative border-4 border-black bg-gradient-to-br from-green-300 to-emerald-400 p-6 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                            <h3 class="mb-5 text-2xl font-black text-black">Add Liquidity</h3>
                            <div class="mb-5">
                                <label class="mb-2 block text-sm font-black text-black">Amount (STX)</label>
                                <input
                                    type="number"
                                    bind:value={addLiquidityAmount}
                                    class="w-full border-3 border-black bg-white px-4 py-3 text-base font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500"
                                    placeholder="100.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <button
                                onclick={addLiquidity}
                                disabled={isAddingLiquidity || !$walletStore.isConnected || addLiquidityAmount <= 0}
                                class="w-full border-3 border-black bg-green-500 px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isAddingLiquidity ? 'Adding...' : 'Add Liquidity'}
                            </button>
                        </div>
                    </div>


                    <!-- Withdraw Liquidity -->
                    <div class="group relative">
                        <div class="absolute inset-0 translate-x-4 translate-y-4 border-4 border-black bg-orange-600"></div>
                        <div class="relative border-4 border-black bg-gradient-to-br from-orange-300 to-amber-400 p-6 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                            <h3 class="mb-5 text-2xl font-black text-black">Withdraw Liquidity</h3>
                            <div class="mb-5">
                                <label class="mb-2 block text-sm font-black text-black">Amount (STX)</label>
                                <input
                                    type="number"
                                    bind:value={withdrawLiquidityAmount}
                                    class="w-full border-3 border-black bg-white px-4 py-3 text-base font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500"
                                    placeholder="10.00"
                                    min="0"
                                    step="0.01"
                                    max={availableLiquidity}
                                />
                                <p class="mt-2 text-xs font-bold text-black/70">Available: {availableLiquidity.toFixed(2)} STX</p>
                            </div>
                            <button
                                onclick={withdrawLiquidity}
                                disabled={isWithdrawingLiquidity || !$walletStore.isConnected || withdrawLiquidityAmount <= 0 || withdrawLiquidityAmount > availableLiquidity}
                                class="w-full border-3 border-black bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isWithdrawingLiquidity ? 'Withdrawing...' : 'Withdraw Liquidity'}
                            </button>
                        </div>
                    </div>


                    <!-- Withdraw Fees -->
                    <div class="group relative">
                        <div class="absolute inset-0 translate-x-4 translate-y-4 border-4 border-black bg-blue-600"></div>
                        <div class="relative border-4 border-black bg-gradient-to-br from-blue-300 to-indigo-400 p-6 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                            <h3 class="mb-5 text-2xl font-black text-black">Withdraw Fees</h3>
                            <div class="mb-5">
                                <label class="mb-2 block text-sm font-black text-black">Amount (STX)</label>
                                <input
                                    type="number"
                                    bind:value={withdrawAmount}
                                    class="w-full border-3 border-black bg-white px-4 py-3 text-base font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500"
                                    placeholder="10.00"
                                    min="0"
                                    step="0.01"
                                    max={totalFees}
                                />
                                <p class="mt-2 text-xs font-bold text-black/70">Available: {totalFees.toFixed(2)} STX</p>
                            </div>
                            <button
                                onclick={withdrawFees}
                                disabled={isWithdrawing || !$walletStore.isConnected || withdrawAmount <= 0 || withdrawAmount > totalFees}
                                class="w-full border-3 border-black bg-blue-500 px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isWithdrawing ? 'Withdrawing...' : 'Withdraw Fees'}
                            </button>
                        </div>
                    </div>
                </div>


                <!-- Update User Score -->
                <div class="group relative">
                    <div class="absolute inset-0 translate-x-4 translate-y-4 border-4 border-black bg-purple-600"></div>
                    <div class="relative border-4 border-black bg-gradient-to-br from-purple-300 to-pink-400 p-6 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                        <h3 class="mb-5 text-2xl font-black text-black">Update User Score</h3>
                        <div class="mb-5 grid gap-4 md:grid-cols-2">
                            <div>
                                <label class="mb-2 block text-sm font-black text-black">User Address</label>
                                <input
                                    type="text"
                                    bind:value={userAddress}
                                    class="w-full border-3 border-black bg-white px-4 py-3 font-mono text-base font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500"
                                    placeholder="ST..."
                                />
                            </div>
                            <div>
                                <label class="mb-2 block text-sm font-black text-black">Credit Score</label>
                                <input
                                    type="number"
                                    bind:value={userScore}
                                    class="w-full border-3 border-black bg-white px-4 py-3 text-base font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500"
                                    placeholder="300-850"
                                    min="300"
                                    max="850"
                                />
                            </div>
                        </div>
                        <button
                            onclick={updateUserScore}
                            disabled={isUpdatingScore || !$walletStore.isConnected || !userAddress || userScore < 300 || userScore > 850}
                            class="w-full border-3 border-black bg-purple-500 px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isUpdatingScore ? 'Updating...' : 'Update Score'}
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</Guardian>
