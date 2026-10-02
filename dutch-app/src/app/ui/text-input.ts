import { Component, input, output } from '@angular/core';

/** Typed-answer box with the settings every Dutch exercise wants:
 *  no autocorrect/capitalisation/spellcheck, Enter submits. */
@Component({
  selector: 'app-text-input',
  template: `
    <input
      type="text"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      [value]="value()"
      [disabled]="disabled()"
      (input)="valueChange.emit($any($event.target).value)"
      (keydown.enter)="submitted.emit()"
    />
  `,
  styles: `
    :host {
      display: block;
    }
    input {
      width: 100%;
      box-sizing: border-box;
      min-height: var(--touch-target);
      padding: var(--space-3);
      font: inherit;
      font-size: var(--text-lg);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
    }
    input:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }
  `,
})
export class TextInput {
  readonly value = input('');
  readonly disabled = input(false);
  readonly valueChange = output<string>();
  readonly submitted = output<void>();
}
