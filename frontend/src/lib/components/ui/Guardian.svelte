<script lang="ts">
    import { useWallet } from '$lib/hooks/useWallet';
    import { onMount } from 'svelte';
    const { connectWallet, isConnected } = useWallet();

    let isLoading = $state(true);
    let { children } = $props();

    const init = async () => {
        if ($isConnected) {
            isLoading = false;
        } else {
            isLoading = false;
        }
    };

    onMount(() => {
        init();
    });
</script>

{#if isLoading}
    <!-- Loading State -->
    <div class="flex min-h-screen items-center justify-center ">
        <div class="text-center">
            <div class="mb-6 inline-flex items-center justify-center relative">
                <div class="absolute w-20 h-20 bg-cyan-400 border-4 border-black animate-ping opacity-30"></div>
                <div class="relative w-20 h-20 bg-purple-400 border-4 border-black animate-spin"></div>
            </div>
            <div class="mb-2 text-3xl font-black text-white [text-shadow:3px_3px_0px_rgba(34,211,238,0.3)]">Loading...</div>
            <p class="text-gray-300 font-bold">Initializing your experience</p>
        </div>
    </div>
{:else if $isConnected}
    <!-- Connected State - Render Children -->
    {@render children()}
{:else}
    <!-- Not Connected State -->
    <div class="flex min-h-screen items-center justify-center  py-12">
        <div class="w-full max-w-md">
            <!-- Main Card -->
            <div class="relative group">
                <!-- Shadow layer -->
                <div class="absolute inset-0 bg-gradient-to-br from-purple-600 to-cyan-600 translate-x-3 translate-y-3 border-4 border-black transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                
                <!-- Main content -->
                <div class="relative bg-gradient-to-br from-cyan-300 to-purple-400 border-4 border-black p-8 text-center transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                    
                    <!-- Decorative corners -->
                    <div class="absolute top-4 right-4 w-8 h-8 bg-amber-300 border-4 border-black rotate-45"></div>
                    <div class="absolute bottom-4 left-4 w-6 h-6 bg-pink-400 border-4 border-black -rotate-12"></div>

                    <!-- Icon/Logo -->
                    <div class="mb-6 flex justify-center relative z-10">
                        <div class="relative">
                            <div class="absolute inset-0 bg-black translate-x-2 translate-y-2 border-4 border-black"></div>
                            <div class="relative flex h-20 w-20 items-center justify-center bg-purple-500 border-4 border-black">
                                <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Badge -->
                    <div class="relative z-10 mb-6 inline-flex items-center gap-2 bg-amber-300 border-4 border-black px-4 py-2 font-black text-sm">
                        <span class="relative flex h-3 w-3">
                            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-75"></span>
                            <span class="relative inline-flex h-3 w-3 rounded-full bg-black"></span>
                        </span>
                        <span class="text-black">WALLET REQUIRED</span>
                    </div>

                    <!-- Title -->
                    <h2 class="relative z-10 mb-4 text-4xl font-black text-black leading-tight [text-shadow:2px_2px_0px_rgba(255,255,255,0.3)]">
                        Connect Your <span class="text-white">Wallet</span>
                    </h2>

                    <!-- Description -->
                    <p class="relative z-10 mb-8 text-black text-base font-bold leading-relaxed">
                        Connect your wallet to access your on-chain credit profile and start building your reputation.
                    </p>

                    <!-- Connect Button -->
                    <div class="relative z-10 group/btn">
                        <div class="absolute inset-0 bg-black translate-x-2 translate-y-2 transition-transform group-hover/btn:translate-x-3 group-hover/btn:translate-y-3"></div>
                        <button
                            onclick={connectWallet}
                            class="relative w-full cursor-pointer bg-white border-4 border-black px-8 py-4 font-black text-black text-lg transition-all group-hover/btn:-translate-x-1 group-hover/btn:-translate-y-1 active:translate-x-1 active:translate-y-1"
                        >
                            Connect Wallet →
                        </button>
                    </div>

                    <!-- Info Text -->
                    <p class="relative z-10 mt-6 text-xs font-bold text-black opacity-70">We support all major Stacks wallets</p>
                </div>
            </div>

            <!-- Features List -->
            <div class="mt-8 space-y-4">
                <!-- Feature 1 -->
                <div class="relative group/feature">
                    <div class="absolute inset-0 bg-purple-600 translate-x-2 translate-y-2 border-4 border-black transition-transform group-hover/feature:translate-x-3 group-hover/feature:translate-y-3"></div>
                    <div class="relative flex items-center gap-4 bg-purple-400 border-4 border-black px-4 py-3 transition-transform group-hover/feature:-translate-x-1 group-hover/feature:-translate-y-1">
                        <div class="flex h-10 w-10 shrink-0 items-center justify-center bg-cyan-400 border-4 border-black">
                            <svg class="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <span class="text-sm font-black text-black">Secure on-chain reputation</span>
                    </div>
                </div>

                <!-- Feature 2 -->
                <div class="relative group/feature">
                    <div class="absolute inset-0 bg-cyan-600 translate-x-2 translate-y-2 border-4 border-black transition-transform group-hover/feature:translate-x-3 group-hover/feature:translate-y-3"></div>
                    <div class="relative flex items-center gap-4 bg-cyan-300 border-4 border-black px-4 py-3 transition-transform group-hover/feature:-translate-x-1 group-hover/feature:-translate-y-1">
                        <div class="flex h-10 w-10 shrink-0 items-center justify-center bg-purple-500 border-4 border-black">
                            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <span class="text-sm font-black text-black">No intermediaries or paperwork</span>
                    </div>
                </div>

                <!-- Feature 3 -->
                <div class="relative group/feature">
                    <div class="absolute inset-0 bg-pink-600 translate-x-2 translate-y-2 border-4 border-black transition-transform group-hover/feature:translate-x-3 group-hover/feature:translate-y-3"></div>
                    <div class="relative flex items-center gap-4 bg-pink-400 border-4 border-black px-4 py-3 transition-transform group-hover/feature:-translate-x-1 group-hover/feature:-translate-y-1">
                        <div class="flex h-10 w-10 shrink-0 items-center justify-center bg-amber-300 border-4 border-black">
                            <svg class="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <span class="text-sm font-black text-black">Transparent credit history</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
