import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TextArea } from './text-area';

export interface NoteDialogData {
  title: string;
  /** Context lines shown above the text box, e.g. the question and the app's answer. */
  lines: string[];
  /** Shows a text box when set; without it the dialog is a plain confirmation. */
  placeholder?: string;
  confirm: string;
}

/** Modal with an optional free-text note, or a plain confirmation.
 *  Built on the CDK dialog (focus trap, Esc, backdrop). */
@Component({
  selector: 'app-note-dialog',
  imports: [TextArea],
  template: `
    <h2 id="note-dialog-title">{{ data.title }}</h2>
    @for (line of data.lines; track $index) {
      <p class="line">{{ line }}</p>
    }
    @if (data.placeholder !== undefined) {
      <app-text-area
        class="field"
        [value]="note()"
        [placeholder]="data.placeholder"
        (valueChange)="note.set($event)"
      />
    }
    <div class="actions">
      <button type="button" (click)="ref.close(null)">Cancel</button>
      <button type="button" class="primary" (click)="ref.close(note())">{{ data.confirm }}</button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      box-sizing: border-box;
      width: min(28rem, calc(100vw - 2rem));
      padding: var(--space-5);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: 0 12px 40px rgb(0 0 0 / 0.35);
      font-family: var(--font-sans);
    }
    h2 {
      margin: 0 0 var(--space-3);
      font-size: var(--text-lg);
    }
    .line {
      margin: 0 0 var(--space-2);
      font-size: var(--text-sm);
      color: var(--color-muted);
    }
    .field {
      margin-top: var(--space-3);
    }
    button:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }
    .actions {
      margin-top: var(--space-4);
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
    }
    button {
      min-height: var(--touch-target);
      padding: var(--space-3) var(--space-4);
      font: inherit;
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      cursor: pointer;
    }
    button.primary {
      color: var(--color-on-accent);
      background: var(--color-accent);
      border-color: var(--color-accent);
    }
  `,
})
export class NoteDialog {
  protected readonly data = inject<NoteDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<string | null>>(DialogRef);
  protected readonly note = signal('');
}

/** Opens the note dialog. Resolves to the note ('' if left empty), or null if cancelled
 *  (Cancel button, Esc or a click on the backdrop). */
export async function openNoteDialog(dialog: Dialog, data: NoteDialogData): Promise<string | null> {
  const ref = dialog.open<string | null>(NoteDialog, {
    data,
    ariaLabelledBy: 'note-dialog-title',
  });
  return (await firstValueFrom(ref.closed)) ?? null;
}
