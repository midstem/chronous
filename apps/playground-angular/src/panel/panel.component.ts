import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
  selector: 'app-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3"
    >
      <h2
        class="flex flex-wrap items-baseline justify-between gap-2 text-[13px] font-semibold"
      >
        {{ title() }}
        @if (badge()) {
          <span class="font-mono text-[10px] font-normal text-faint">
            {{ badge() }}
          </span>
        }
      </h2>
      <ng-content />
    </section>
  `
})
export class PanelComponent {
  readonly title = input.required<string>()
  readonly badge = input<string>()
}
