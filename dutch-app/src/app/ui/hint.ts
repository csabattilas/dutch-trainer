import { Component, computed, input, output } from '@angular/core';

/** Progressive hints: each tap reveals one more. `shown` is owned by the parent so it can
 *  reset per question and report whether a hint was used. */
@Component({
  selector: 'app-hint',
  template: `
    @for (h of visible(); track $index) {
      <p class="hint">{{ h }}</p>
    }
    @if (remaining() > 0) {
      <button type="button" [disabled]="disabled()" (click)="more.emit()">
        Hint ({{ remaining() }} left)
      </button>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .hint {
      margin: 0 0 var(--space-2);
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-sm);
      color: var(--color-text);
      background: var(--color-surface);
      border-left: 3px solid var(--color-accent);
      border-radius: var(--radius);
    }
    button {
      min-height: var(--touch-target);
      padding: var(--space-2) var(--space-4);
      color: var(--color-muted);
      background: transparent;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius);
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
  `,
})
export class Hint {
  readonly hints = input.required<readonly string[]>();
  readonly shown = input(0);
  readonly disabled = input(false);
  readonly more = output<void>();

  protected readonly visible = computed(() => this.hints().slice(0, this.shown()));
  protected readonly remaining = computed(() => this.hints().length - this.shown());
}
