<script setup lang="ts">
defineProps<{
  title: string
  badge?: string
}>()
</script>

<template>
  <section
    class="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3"
  >
    <h2
      class="flex flex-wrap items-baseline justify-between gap-2 text-[13px] font-semibold"
    >
      {{ title }}
      <span v-if="badge" class="font-mono text-[10px] font-normal text-faint">
        {{ badge }}
      </span>
    </h2>
    <slot />
  </section>
</template>
