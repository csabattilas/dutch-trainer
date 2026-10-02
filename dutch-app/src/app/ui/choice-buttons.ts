import { Component, input, output } from '@angular/core';

/** Multiple-choice grid. After `given` is set, the right answer shows green
 *  and a wrong pick shows red. */
@Component({
  selector: 'app-choice-buttons',
  template: `
    @for (c of choices(); track c) {
      <button
        type="button"
        [class.correct]="given() !== null && c === answer()"
        [class.wrong]="(given() !== null && c === given() && c !== answer()) || eliminated().includes(c)"
        [disabled]="given() !== null || eliminated().includes(c)"
        (click)="picked.emit(c)"
      >
        {{ c }}
      </button>
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }
    button {
      min-height: var(--touch-target);
      padding: var(--space-3) var(--space-4);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }
    button:disabled {
      cursor: default;
    }
    button.correct {
      background: var(--color-correct-bg);
      border-color: var(--color-correct-border);
    }
    button.wrong {
      background: var(--color-wrong-bg);
      border-color: var(--color-wrong-border);
    }
  `,
})
export class ChoiceButtons {
  readonly choices = input.required<readonly string[]>();
  readonly answer = input.required<string>();
  /** null until the learner has answered. */
  readonly given = input<string | null>(null);
  /** Wrong picks from a first attempt: shown red and disabled during the second chance. */
  readonly eliminated = input<readonly string[]>([]);
  readonly picked = output<string>();
}
