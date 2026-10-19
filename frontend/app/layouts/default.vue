<template>
  <div class="layout">
    <AppNavbar />
    <main class="content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
.content { flex: 1; width: 100%; max-width: 1100px; margin: 0 auto; padding: 24px 20px; }
</style>
