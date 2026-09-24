import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  viewChild
} from '@angular/core'
import {
  BASELINE_NOTE,
  CLOSE_LABEL,
  COPY,
  DIALOG_TITLE,
  DOCS_URL,
  SUPPORT,
  SUPPORT_TITLE,
  runtimeStateOf
} from '@midstem/playground-core'

@Component({
  selector: 'app-runtime',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [attr.title]="copy.summary"
      aria-haspopup="dialog"
      class="rounded-full border border-line bg-raised px-2.5 py-1 font-mono text-[11px] text-muted hover:border-line hover:text-ink"
      (click)="openModal()"
    >
      {{ copy.badge }}
    </button>

    <dialog
      #dialog
      closedby="any"
      aria-labelledby="runtime-dialog-title"
      class="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-black/50"
      (click)="onBackdropClick($event)"
    >
      <div class="flex flex-col gap-3 p-4">
        <h2 id="runtime-dialog-title" class="text-sm font-semibold">
          {{ dialogTitle }}
        </h2>

        <p class="font-mono text-[11px] text-accent">{{ copy.badge }}</p>

        <p class="text-[13px] leading-5">{{ copy.detail }}</p>

        <section class="flex flex-col gap-1.5 rounded-lg bg-sunken p-3">
          <h3
            class="text-[11px] font-semibold tracking-wide text-muted uppercase"
          >
            {{ supportTitle }}
          </h3>

          <ul class="flex flex-col gap-1">
            @for (row of support; track row.browser) {
              <li class="flex items-baseline justify-between gap-3 text-[12px]">
                <span>{{ row.browser }}</span>
                <span class="flex items-baseline gap-2">
                  <span class="font-mono tabular-nums">{{ row.since }}</span>
                  <span class="text-[11px] text-faint">{{ row.when }}</span>
                </span>
              </li>
            }
          </ul>

          <p class="pt-1 text-[11px] leading-4 text-muted">
            {{ baselineNote }}
          </p>
        </section>

        <div class="flex items-center justify-between gap-3">
          <a
            class="text-[12px] text-accent underline underline-offset-2"
            [href]="docsUrl"
            target="_blank"
            rel="noreferrer"
          >
            {{ docsLabel }}
          </a>

          <button type="button" class="ghost-button" (click)="closeModal()">
            {{ closeLabel }}
          </button>
        </div>
      </div>
    </dialog>
  `
})
export class RuntimeComponent {
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog')

  readonly state = runtimeStateOf()
  readonly copy = COPY[this.state]
  readonly dialogTitle = DIALOG_TITLE
  readonly supportTitle = SUPPORT_TITLE
  readonly support = SUPPORT
  readonly baselineNote = BASELINE_NOTE
  readonly docsUrl = DOCS_URL
  readonly docsLabel = 'Learn about Temporal'
  readonly closeLabel = CLOSE_LABEL

  openModal(): void {
    this.dialog()?.nativeElement.showModal()
  }

  closeModal(): void {
    this.dialog()?.nativeElement.close()
  }

  onBackdropClick(event: MouseEvent): void {
    const dialogEl = this.dialog()?.nativeElement
    if (dialogEl && event.target === dialogEl) {
      dialogEl.close()
    }
  }
}
