import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core'
import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-angular'
import { isSimple } from '@midstem/playground-core'
import type { EventData, Style } from '@midstem/playground-core'

import { CodeComponent } from '../code/code.component'

import {
  FILE_NAME,
  SIMPLE_HINT,
  SNIPPET_HINT,
  badgeOf,
  simpleBadgeOf
} from './constants'
import { snippetOf } from './helpers'
import { simpleOf } from './simple'

@Component({
  selector: 'app-snippet',
  standalone: true,
  imports: [CodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-code
      [fileName]="fileName"
      [badge]="badge()"
      [hint]="hint()"
      [source]="source()"
    />
  `
})
export class SnippetComponent {
  readonly range = input.required<CalendarRange>()
  readonly events = input.required<readonly EventInput<EventData>[]>()
  readonly locale = input.required<LocaleId>()
  readonly hourHeight = input.required<number>()
  readonly style = input.required<Style>()

  readonly fileName = FILE_NAME

  readonly simple = computed(() => isSimple(this.style()))

  readonly hint = computed(() => (this.simple() ? SIMPLE_HINT : SNIPPET_HINT))

  readonly badge = computed(() =>
    this.simple()
      ? simpleBadgeOf(this.range().view, this.events().length)
      : badgeOf(
          this.range().view,
          this.hourHeight(),
          this.locale(),
          this.events().length
        )
  )

  readonly source = computed(() =>
    this.simple()
      ? simpleOf(this.range(), this.events(), this.locale(), this.hourHeight())
      : snippetOf(this.range(), this.events(), this.locale(), this.hourHeight())
  )
}
