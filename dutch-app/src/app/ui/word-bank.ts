import { Component, input } from '@angular/core';

/** The building blocks of a sentence, shown for reference only: the learner types the sentence. */
@Component({
  selector: 'app-word-bank',
  template: `
    @for (w of words(); track $index) {
      <span class="word">{{ w }}</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .word {
      padding: var(--space-1) var(--space-3);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius);
    }
  `,
})
export class WordBank {
  readonly words = input.required<readonly string[]>();
}
