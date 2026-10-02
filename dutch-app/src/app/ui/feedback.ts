import { Component, input } from '@angular/core';

@Component({
  selector: 'app-feedback',
  template: `
    <div class="box" [class.ok]="correct()" [class.bad]="!correct()">
      <strong>{{ correct() ? (secondTry() ? 'Correct on the second try!' : 'Correct!') : 'Not quite.' }}</strong>
      @if (!correct()) {
        <div>Answer: {{ answer() }}</div>
      }
      <div>{{ explanation() }}</div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .box {
      padding: var(--space-3) var(--space-4);
      border: 1px solid transparent;
      border-radius: var(--radius);
    }
    .ok {
      background: var(--color-correct-bg);
      border-color: var(--color-correct-border);
    }
    .bad {
      background: var(--color-wrong-bg);
      border-color: var(--color-wrong-border);
    }
  `,
})
export class Feedback {
  readonly correct = input.required<boolean>();
  readonly answer = input.required<string>();
  readonly explanation = input.required<string>();
  readonly secondTry = input(false);
}
