<script setup lang="ts">
defineProps<{
  title: string
  badge?: string
}>()
</script>

<template>
  <section class="panel">
    <header class="panel-header">
      <h3 class="panel-title">{{ title }}</h3>
      <span v-if="badge" class="panel-badge">{{ badge }}</span>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>
