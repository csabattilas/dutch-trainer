import { Component, input, output } from '@angular/core';

/** Multi-line writing box: no autocorrect/capitalisation, so the learner's own
 *  mistakes reach the tutor unchanged. Also used for notes in the report dialog. */
@Component({
  selector: 'app-text-area',
  template: `
    <textarea
      lang="nl"
      rows="4"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="valueChange.emit($any($event.target).value)"
    ></textarea>
  `,
  styles: `
    :host {
      display: block;
    }
    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: var(--space-3);
      font: inherit;
      font-size: var(--text-md);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      resize: vertical;
    }
    textarea:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }
  `,
})
export class TextArea {
  readonly value = input('');
  readonly placeholder = input('');
  readonly valueChange = output<string>();
}
