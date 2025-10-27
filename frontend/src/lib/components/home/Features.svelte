<script lang="ts">
  // No script needed
</script>

<div class="px-4 sm:px-10 lg:px-40 flex flex-1 justify-center py-16">
  <div class="layout-content-container flex flex-col max-w-[960px] flex-1">
    <div class="flex flex-col gap-12 px-4 py-10 @container">
      <!-- Header Section -->
      <div class="flex flex-col gap-6 text-center items-center">
        <h1 class="text-white text-4xl font-black leading-tight tracking-[-0.033em] max-w-[720px] [text-shadow:3px_3px_0px_rgba(34,211,238,0.3)]">
          Everything You Need in One <span class="relative inline-block">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Unified Platform</span>
          </span>
        </h1>
        <p class="text-gray-300 text-lg font-bold leading-normal max-w-[720px]">
          BridgeFi combines a powerful cross-chain exchange with a revolutionary DeFi credit scoring system to unlock your full on-chain potential.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Feature 1 - Morado -->
        <div class="group relative">
          <div class="absolute inset-0 bg-purple-600 translate-x-2 translate-y-2 border-4 border-black transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
          <div class="relative flex flex-1 gap-4 bg-purple-400 border-4 border-black p-6 flex-col text-left transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
            <div class="w-14 h-14 bg-cyan-400 border-4 border-black flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform">
              <svg class="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div class="flex flex-col gap-2">
              <h2 class="text-black text-lg font-black leading-tight">Cross-Chain Swaps</h2>
              <p class="text-black text-sm font-bold leading-normal opacity-80">Swap assets across any chain instantly with deep liquidity and minimal slippage.</p>
            </div>
          </div>
        </div>

        <!-- Feature 2 - Cyan -->
        <div class="group relative">
          <div class="absolute inset-0 bg-cyan-600 translate-x-2 translate-y-2 border-4 border-black transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
          <div class="relative flex flex-1 gap-4 bg-cyan-300 border-4 border-black p-6 flex-col text-left transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
            <div class="w-14 h-14 bg-purple-500 border-4 border-black flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="flex flex-col gap-2">
              <h2 class="text-black text-lg font-black leading-tight">DeFi Credit Score</h2>
              <p class="text-black text-sm font-bold leading-normal opacity-80">Build your on-chain reputation and access undercollateralized financial products.</p>
            </div>
          </div>
        </div>

        <!-- Feature 3 - Amarillo -->
        <div class="group relative">
          <div class="absolute inset-0 bg-amber-600 translate-x-2 translate-y-2 border-4 border-black transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
          <div class="relative flex flex-1 gap-4 bg-amber-300 border-4 border-black p-6 flex-col text-left transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
            <div class="w-14 h-14 bg-pink-500 border-4 border-black flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="flex flex-col gap-2">
              <h2 class="text-black text-lg font-black leading-tight">Optimized Liquidity</h2>
              <p class="text-black text-sm font-bold leading-normal opacity-80">Our smart routing ensures you get the best rates for every single transaction.</p>
            </div>
          </div>
        </div>

        <!-- Feature 4 - Rosa -->
        <div class="group relative">
          <div class="absolute inset-0 bg-pink-600 translate-x-2 translate-y-2 border-4 border-black transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
          <div class="relative flex flex-1 gap-4 bg-pink-400 border-4 border-black p-6 flex-col text-left transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
            <div class="w-14 h-14 bg-cyan-400 border-4 border-black flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform">
              <svg class="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="flex flex-col gap-2">
              <h2 class="text-black text-lg font-black leading-tight">Secure & Decentralized</h2>
              <p class="text-black text-sm font-bold leading-normal opacity-80">Built on decentralized principles, ensuring your assets remain in your control.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
