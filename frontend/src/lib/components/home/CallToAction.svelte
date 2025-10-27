<script lang="ts">
  // No script needed
</script>

<div class="px-4 sm:px-10 lg:px-40 flex flex-1 justify-center py-20">
  <div class="layout-content-container flex flex-col max-w-[960px] flex-1">
    <div class="relative group">
      <!-- Shadow layer -->
      <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 translate-x-3 translate-y-3 border-4 border-black transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
      
      <!-- Main card -->
      <div class="relative bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 border-4 border-black flex flex-col items-center text-center gap-8 p-10 md:p-16 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
        
        <!-- Decorative elements -->
        <div class="absolute top-4 left-4 w-12 h-12 bg-amber-300 border-4 border-black rotate-12"></div>
        <div class="absolute top-4 right-4 w-8 h-8 bg-lime-300 border-4 border-black -rotate-12"></div>
        <div class="absolute bottom-4 left-8 w-10 h-10 bg-cyan-300 border-4 border-black rotate-45"></div>
        <div class="absolute bottom-4 right-8 w-6 h-6 bg-pink-300 border-4 border-black -rotate-45"></div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col gap-6">
          <h2 class="text-black text-4xl md:text-5xl font-black tracking-tight leading-tight [text-shadow:3px_3px_0px_rgba(255,255,255,0.3)]">
            Ready to Redefine Your <span class="relative inline-block">
              <span class="text-white">DeFi Experience?</span>
            </span>
          </h2>
          <p class="text-black text-lg font-bold max-w-2xl mx-auto leading-relaxed">
            Join BridgeFi today and unlock the full potential of your on-chain assets with cross-chain swaps and your decentralized credit score.
          </p>
        </div>

        <!-- CTA Button -->
        <div class="relative z-10 group/btn">
          <div class="absolute inset-0 bg-black translate-x-2 translate-y-2 transition-transform group-hover/btn:translate-x-3 group-hover/btn:translate-y-3"></div>
          <button class="relative flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden h-14 px-8 bg-white border-4 border-black text-black text-lg font-black leading-normal tracking-wide transition-all group-hover/btn:-translate-x-1 group-hover/btn:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none">
            <span class="truncate">Launch App Now</span>
            <svg class="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        <!-- Stats badges -->
        <div class="relative z-10 flex flex-wrap items-center justify-center gap-4 mt-4">
          <div class="px-4 py-2 bg-white border-4 border-black font-black text-sm">
            🔥 10K+ Users
          </div>
          <div class="px-4 py-2 bg-white border-4 border-black font-black text-sm">
            💰 $50M+ Volume
          </div>
          <div class="px-4 py-2 bg-white border-4 border-black font-black text-sm">
            ⚡ Lightning Fast
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
