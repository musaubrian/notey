<template>
  <ClientOnly>
    <div
      v-if="
        $pwa?.showInstallPrompt && !$pwa?.offlineReady && !$pwa?.needRefresh
      "
      class="flex flex-col border-2 border-slate-500 rounded-md w-11/12 md:w-3/12 justify-center items-center p-2 text-lg fixed bottom-5 left-5"
      role="alert"
    >
      <div class="my-5">
        <span> Install Notey</span>
      </div>
      <button
        @click="$pwa?.install()"
        class="btn bg-emerald-500/70 text-slate-900 w-5/6 my-2 hover:bg-emerald-500/50 font-semibold transition-all"
      >
        Install
      </button>
      <button
        @click="$pwa?.cancelInstall()"
        class="btn bg-red-500/70 w-5/6 fot-semibold transition-all hover:bg-red-500/50 text-slate-100 hover:text-slate-300"
      >
        Cancel
      </button>
    </div>
  </ClientOnly>
  <slot />
</template>
