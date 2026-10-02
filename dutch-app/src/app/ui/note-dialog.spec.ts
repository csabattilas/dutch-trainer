import { Dialog } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { openNoteDialog } from './note-dialog';

describe('openNoteDialog', () => {
  const data = { title: 'Report', lines: ['Question: x'], placeholder: 'note', confirm: 'Save' };

  function buttons(): HTMLButtonElement[] {
    return [...document.querySelectorAll<HTMLButtonElement>('app-note-dialog button')];
  }

  it('resolves to the typed note on confirm', async () => {
    const result = openNoteDialog(TestBed.inject(Dialog), data);
    await new Promise((r) => setTimeout(r));
    const textarea = document.querySelector<HTMLTextAreaElement>('app-note-dialog textarea')!;
    textarea.value = 'sounds odd';
    textarea.dispatchEvent(new Event('input'));
    buttons().find((b) => b.textContent!.includes('Save'))!.click();
    expect(await result).toBe('sounds odd');
  });

  it('resolves to null on cancel', async () => {
    const result = openNoteDialog(TestBed.inject(Dialog), data);
    await new Promise((r) => setTimeout(r));
    buttons().find((b) => b.textContent!.includes('Cancel'))!.click();
    expect(await result).toBeNull();
  });

  it('has no text box without a placeholder (confirmation)', async () => {
    const result = openNoteDialog(TestBed.inject(Dialog), { title: 'Sure?', lines: [], confirm: 'Delete' });
    await new Promise((r) => setTimeout(r));
    expect(document.querySelector('app-note-dialog textarea')).toBeNull();
    buttons().find((b) => b.textContent!.includes('Delete'))!.click();
    expect(await result).toBe('');
  });
});
