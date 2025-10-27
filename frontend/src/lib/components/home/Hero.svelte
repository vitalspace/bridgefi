<script lang="ts">
  let isHovering = false;
</script>

<div class="px-4 sm:px-10 lg:px-40 flex flex-1 justify-center py-20">
  <div class="layout-content-container flex flex-col max-w-[960px] flex-1">
    <div class="@container">
      <div class="@[480px]:p-4">
        <div
          class="relative min-h-[480px] flex flex-col gap-6 @[480px]:gap-8 @[480px]:rounded-xl items-center text-center justify-center px-4 py-10 @[480px]:px-10 bg-gradient-to-br from-orange-50 via-white to-red-50 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]"
        >
          <!-- Decorative elements -->
          <div class="absolute top-4 right-4 w-16 h-16 bg-cyan-400 border-4 border-black rotate-12 animate-bounce-slow"></div>
          <div class="absolute bottom-4 left-4 w-20 h-20 bg-purple-500 border-4 border-black -rotate-12 animate-spin-slow"></div>
          
          <div class="relative z-10 flex flex-col gap-4 text-center max-w-3xl">
            <h1
              class="text-black text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] [text-shadow:3px_3px_0px_rgba(34,211,238,0.3)]"
            >
              The Future of DeFi: Seamless Cross-Chain Swaps & Your Decentralized <span class="relative inline-block bg-amber-300 px-2 border-4 border-black rotate-[-1deg]">Credit Score.</span>
            </h1>
            <h2
              class="text-gray-800 text-base font-bold leading-normal @[480px]:text-lg @[480px]:font-bold @[480px]:leading-normal"
            >
              Access multichain liquidity and unlock new financial opportunities with BridgeFi's unified platform.
            </h2>
          </div>
          
          <div class="relative z-10 flex-wrap gap-3 flex">
            <a
            href="/swap"
              class="relative flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-none h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-cyan-400 text-black text-sm font-black leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-black @[480px]:leading-normal @[480px]:tracking-[0.015em] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
            >
              <span class="truncate">Swap</span>
            </a>
            <a
            href="/docs"
              class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-none h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-white text-black text-sm font-black leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-black @[480px]:leading-normal @[480px]:tracking-[0.015em] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
            >
              <span class="truncate">Learn More</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0) rotate(12deg); }
    50% { transform: translateY(-20px) rotate(12deg); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(-12deg); }
    to { transform: rotate(348deg); }
  }
  
  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
</style>
