/**
 * The only import point for UI building blocks. Feature code (exercise screens, pages)
 * imports from here and never from a UI library directly, so a library can be swapped
 * in behind these components later without touching the features.
 * Keep their inputs/outputs plain and library-agnostic.
 */
export { ChoiceButtons } from './choice-buttons';
export { Feedback } from './feedback';
export { Hint } from './hint';
export { NoteDialog, openNoteDialog, type NoteDialogData } from './note-dialog';
export { TextArea } from './text-area';
export { TextInput } from './text-input';
export { WordBank } from './word-bank';
export { WordTiles } from './word-tiles';
