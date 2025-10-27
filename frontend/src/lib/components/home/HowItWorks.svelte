<script lang="ts">
  // No script needed
</script>

<div class="px-4 sm:px-10 lg:px-40 flex flex-1 justify-center py-16">
  <div class="layout-content-container flex flex-col max-w-[960px] flex-1 items-center gap-12">
    <!-- Title -->
    <div class="relative inline-block">
      <h2 class="text-white text-4xl font-black leading-tight tracking-[-0.033em] [text-shadow:4px_4px_0px_rgba(168,85,247,0.4)]">
        How It Works
      </h2>
      <div class="absolute -bottom-2 left-0 w-full h-2 bg-cyan-400 border-2 border-black"></div>
    </div>

    <!-- Steps Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      <!-- Step 1 - Purple -->
      <div class="group relative flex flex-col items-center text-center gap-6">
        <!-- Number Badge -->
        <div class="absolute -top-3 -left-3 w-10 h-10 bg-amber-300 border-4 border-black flex items-center justify-center font-black text-xl rotate-12 z-10">
          1
        </div>
        
        <!-- Icon Container -->
        <div class="relative">
          <div class="absolute inset-0 bg-purple-600 translate-x-2 translate-y-2 rounded-none border-4 border-black transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
          <div class="relative w-20 h-20 bg-purple-400 border-4 border-black flex items-center justify-center transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:rotate-6">
            <svg class="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="flex flex-col gap-3">
          <h3 class="text-2xl font-black text-white">Connect Wallet</h3>
          <p class="text-gray-300 text-sm font-bold">Securely connect your favorite Web3 wallet to get started in seconds.</p>
        </div>

        <!-- Arrow for desktop -->
        <div class="hidden md:block absolute -right-8 top-12 text-cyan-400">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      <!-- Step 2 - Cyan -->
      <div class="group relative flex flex-col items-center text-center gap-6">
        <!-- Number Badge -->
        <div class="absolute -top-3 -left-3 w-10 h-10 bg-pink-400 border-4 border-black flex items-center justify-center font-black text-xl rotate-12 z-10">
          2
        </div>
        
        <!-- Icon Container -->
        <div class="relative">
          <div class="absolute inset-0 bg-cyan-600 translate-x-2 translate-y-2 rounded-none border-4 border-black transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
          <div class="relative w-20 h-20 bg-cyan-300 border-4 border-black flex items-center justify-center transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:rotate-6">
            <svg class="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="flex flex-col gap-3">
          <h3 class="text-2xl font-black text-white">Get Score</h3>
          <p class="text-gray-300 text-sm font-bold">Generate your decentralized credit score based on your on-chain history.</p>
        </div>

        <!-- Arrow for desktop -->
        <div class="hidden md:block absolute -right-8 top-12 text-purple-400">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      <!-- Step 3 - Pink -->
      <div class="group relative flex flex-col items-center text-center gap-6">
        <!-- Number Badge -->
        <div class="absolute -top-3 -left-3 w-10 h-10 bg-lime-300 border-4 border-black flex items-center justify-center font-black text-xl rotate-12 z-10">
          3
        </div>
        
        <!-- Icon Container -->
        <div class="relative">
          <div class="absolute inset-0 bg-pink-600 translate-x-2 translate-y-2 rounded-none border-4 border-black transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
          <div class="relative w-20 h-20 bg-pink-400 border-4 border-black flex items-center justify-center transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:rotate-6">
            <svg class="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="flex flex-col gap-3">
          <h3 class="text-2xl font-black text-white">Swap Assets</h3>
          <p class="text-gray-300 text-sm font-bold">Swap tokens across multiple blockchains with the best rates, seamlessly.</p>
        </div>
      </div>
    </div>

    <!-- Decorative element -->
    <div class="flex items-center gap-2 mt-4">
      <div class="w-4 h-4 bg-purple-400 border-2 border-black rotate-45"></div>
      <div class="w-4 h-4 bg-cyan-400 border-2 border-black rotate-45"></div>
      <div class="w-4 h-4 bg-pink-400 border-2 border-black rotate-45"></div>
      <div class="w-4 h-4 bg-amber-300 border-2 border-black rotate-45"></div>
      <div class="w-4 h-4 bg-lime-300 border-2 border-black rotate-45"></div>
    </div>
  </div>
</div>
