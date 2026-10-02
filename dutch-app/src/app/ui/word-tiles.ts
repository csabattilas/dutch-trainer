import { Component, effect, input, output, signal } from '@angular/core';

/** Tap words from the bank to build a sentence; tap a placed word to take it back.
 *  Emits the sentence as a space-joined string on every change. Tap-based (no dragging),
 *  so it behaves the same with mouse, touch and keyboard. */
@Component({
  selector: 'app-word-tiles',
  template: `
    <div class="answer" aria-live="polite">
      @for (i of placed(); track i) {
        <button type="button" class="tile placed" [disabled]="disabled()" (click)="remove(i)">
          {{ tiles()[i] }}
        </button>
      } @empty {
        <span class="hint">Tap the words in order</span>
      }
    </div>
    <div class="bank">
      @for (t of tiles(); track $index) {
        <button
          type="button"
          class="tile"
          [disabled]="disabled() || placed().includes($index)"
          (click)="add($index)"
        >
          {{ t }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .answer,
    .bank {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
    }
    .answer {
      min-height: calc(var(--touch-target) + var(--space-4));
      padding: var(--space-2);
      margin-bottom: var(--space-4);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius);
    }
    .hint {
      color: var(--color-muted);
      padding-left: var(--space-2);
    }
    .tile {
      min-height: var(--touch-target);
      padding: var(--space-2) var(--space-4);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      cursor: pointer;
    }
    .tile.placed {
      border-color: var(--color-accent);
    }
    .tile:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }
    .tile:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .answer .tile:disabled {
      opacity: 1;
    }
  `,
})
export class WordTiles {
  readonly tiles = input.required<readonly string[]>();
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  /** Indices into tiles(), in the order the learner placed them. */
  protected readonly placed = signal<number[]>([]);

  constructor() {
    // New exercise => start empty.
    effect(() => {
      this.tiles();
      this.placed.set([]);
    });
  }

  protected add(index: number): void {
    this.placed.update((p) => [...p, index]);
    this.emit();
  }

  protected remove(index: number): void {
    this.placed.update((p) => p.filter((i) => i !== index));
    this.emit();
  }

  private emit(): void {
    this.valueChange.emit(
      this.placed()
        .map((i) => this.tiles()[i])
        .join(' '),
    );
  }
}
