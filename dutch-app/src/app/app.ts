import { Dialog } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { autoAdvanceDelay, grade } from './core/answer';
import { buildSession } from './core/session';
import { DELAYS, loadSettings, saveSettings, SIZES, type Settings } from './core/settings';
import { review, type Progress } from './core/srs';
import { loadCredits } from './core/data';
import { flag, loadReports, reportsToText, saveReports, type FlaggedQuestion } from './core/reports';
import { loadNoticeDismissed, loadProgress, saveNoticeDismissed, saveProgress } from './core/storage';
import type { CreditsFile } from './data/format';
import { askUrls, tutorPrompt } from './core/tutor-prompt';
import type { Exercise, ExerciseModule } from './core/types';
import { modules } from './modules/registry';
import { ChoiceButtons, Feedback, Hint, openNoteDialog, TextArea, TextInput, WordBank, WordTiles } from './ui';

type Screen = 'menu' | 'quiz' | 'done' | 'write' | 'settings' | 'about' | 'reports';

@Component({
  imports: [ChoiceButtons, Feedback, Hint, TextArea, TextInput, WordBank, WordTiles],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly dialog = inject(Dialog);
  /** A newer version was downloaded in the background and is ready after a reload. */
  protected readonly updateReady = signal(false);

  constructor() {
    // Optional: not provided in unit tests; disabled in dev mode.
    const updates = inject(SwUpdate, { optional: true });
    if (updates?.isEnabled) {
      updates.versionUpdates.pipe(takeUntilDestroyed()).subscribe((event) => {
        if (event.type === 'VERSION_READY') this.updateReady.set(true);
      });
    }
  }

  protected reload(): void {
    document.location.reload();
  }
  protected readonly sizes = SIZES;
  protected readonly delays = DELAYS;
  protected readonly screen = signal<Screen>('menu');
  protected readonly settings = signal<Settings>(loadSettings());
  protected readonly progress = signal<Progress>(loadProgress());
  protected readonly noticeDismissed = signal(loadNoticeDismissed());
  /** Questions flagged as possibly wrong, kept on this device until exported. */
  protected readonly reports = signal<FlaggedQuestion[]>(loadReports());
  /** The current question has been reported. */
  protected readonly reported = signal(false);
  protected readonly reportsCopied = signal(false);
  /** undefined = not loaded yet, null = failed to load. */
  protected readonly credits = signal<CreditsFile | null | undefined>(undefined);

  /** Which module (or null = mixed review) the current/last session used. */
  private lastModuleId: string | null = null;
  private advanceTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly session = signal<Exercise[]>([]);
  protected readonly index = signal(0);
  protected readonly typed = signal('');
  protected readonly result = signal<{ correct: boolean; given: string; secondTry: boolean } | null>(null);
  protected readonly score = signal(0);
  /** How many hints of the current question have been revealed. */
  protected readonly hintsShown = signal(0);
  /** Second chance in progress: the first answer was wrong. */
  protected readonly retrying = signal(false);
  /** Wrong picks from the first attempt, greyed out during the second chance. */
  protected readonly eliminated = signal<string[]>([]);

  protected readonly current = computed(() => this.session()[this.index()]);

  /** Write screen: free writing checked by an external AI tutor. */
  protected readonly writeModule = signal<ExerciseModule | null>(null);
  protected readonly draft = signal('');
  protected readonly copied = signal(false);
  protected readonly tutorLinks = computed(() => {
    const task = this.writeModule()?.writing;
    const text = this.draft().trim();
    return task && text ? askUrls(tutorPrompt(text, task)) : null;
  });

  /** Menu cards: each module with your accuracy on its skills (null until practised). */
  protected readonly moduleCards = computed(() =>
    modules.map((m) => {
      const own = Object.entries(this.progress()).filter(([skill]) => skill.startsWith(`${m.id}/`));
      const seen = own.reduce((n, [, s]) => n + s.seen, 0);
      const correct = own.reduce((n, [, s]) => n + s.correct, 0);
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        canWrite: !!m.writing,
        accuracy: seen ? Math.round((100 * correct) / seen) : null,
      };
    }),
  );

  /** Weakest skills first, so you can see which rules keep tripping you up. */
  protected readonly skillStats = computed(() =>
    Object.entries(this.progress())
      .map(([skill, s]) => ({
        skill,
        seen: s.seen,
        accuracy: Math.round((100 * s.correct) / s.seen),
      }))
      .sort((a, b) => a.accuracy - b.accuracy),
  );

  protected updateSettings(patch: Partial<Settings>): void {
    this.settings.update((s) => {
      const next = { ...s, ...patch };
      saveSettings(next);
      return next;
    });
  }

  /** Start a session for one module, or a mixed review of all modules when no id is given. */
  protected start(moduleId: string | null = this.lastModuleId): void {
    this.clearTimer();
    this.lastModuleId = moduleId;
    const session = buildSession(modules, this.progress(), Math.random, this.settings().size, {
      moduleIds: moduleId ? [moduleId] : undefined,
      choiceOnly: this.settings().style === 'choice',
    });
    this.session.set(session);
    this.index.set(0);
    this.score.set(0);
    this.resetQuestion();
    this.screen.set(session.length ? 'quiz' : 'menu');
  }

  protected check(given: string): void {
    const exercise = this.current();
    if (!exercise || this.result()) return;
    const outcome = grade(exercise, given, {
      secondChance: this.settings().secondChance,
      retrying: this.retrying(),
    });

    if (outcome.kind === 'retry') {
      this.retrying.set(true);
      this.eliminated.update((e) => [...e, given]);
      return;
    }

    const { correct, secondTry } = outcome;
    this.result.set({ correct, given, secondTry });
    if (correct && !secondTry) this.score.update((s) => s + 1);
    this.progress.update((p) => {
      // Needing a hint or a second try: right, but not known cold, so the box doesn't advance.
      const hinted = this.hintsShown() > 0 || secondTry;
      const updated = { ...p, [exercise.skill]: review(p[exercise.skill], correct, { hinted }) };
      saveProgress(updated);
      return updated;
    });

    const { autoAdvance, delaySeconds } = this.settings();
    const delay = autoAdvanceDelay(autoAdvance, correct, delaySeconds);
    if (delay !== null) this.advanceTimer = setTimeout(() => this.next(), delay);
  }

  protected next(): void {
    this.clearTimer();
    if (this.index() + 1 >= this.session().length) {
      this.screen.set('done');
      return;
    }
    this.index.update((i) => i + 1);
    this.resetQuestion();
  }

  protected menu(): void {
    this.clearTimer();
    this.screen.set('menu');
  }

  protected openSettings(): void {
    this.screen.set('settings');
  }

  protected async openAbout(): Promise<void> {
    this.screen.set('about');
    if (this.credits() === undefined) this.credits.set(await loadCredits());
  }

  /** Flag the current question. The note is optional; Cancel aborts. */
  protected async reportCurrent(): Promise<void> {
    const exercise = this.current();
    if (!exercise || this.reported()) return;
    this.clearTimer(); // don't auto-advance away from the question being reported
    const note = await openNoteDialog(this.dialog, {
      title: 'Report this question',
      lines: [`Question: ${exercise.prompt}`, `App's answer: ${exercise.answer}`],
      placeholder: 'What looks wrong? (optional)',
      confirm: 'Save report',
    });
    if (note === null) return;
    const given = this.result()?.given ?? (this.typed() || this.eliminated()[0]);
    this.reports.update((list) => {
      const next = [...list, flag(exercise, given, note)];
      saveReports(next);
      return next;
    });
    this.reported.set(true);
  }

  protected openReports(): void {
    this.reportsCopied.set(false);
    this.screen.set('reports');
  }

  protected async copyReports(): Promise<void> {
    try {
      await navigator.clipboard.writeText(reportsToText(this.reports()));
      this.reportsCopied.set(true);
    } catch {
      this.reportsCopied.set(false);
    }
  }

  protected downloadReports(): void {
    const blob = new Blob([JSON.stringify(this.reports(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dutch-trainer-reports-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  protected async clearReports(): Promise<void> {
    const ok = await openNoteDialog(this.dialog, {
      title: 'Clear reported questions?',
      lines: ['Copy or download them first if you still want them checked.'],
      confirm: 'Delete reports',
    });
    if (ok === null) return;
    this.reports.set([]);
    saveReports([]);
  }

  protected dismissNotice(): void {
    this.noticeDismissed.set(true);
    saveNoticeDismissed();
  }

  protected async resetProgress(): Promise<void> {
    const ok = await openNoteDialog(this.dialog, {
      title: 'Reset progress?',
      lines: ['This deletes all your progress on this device. It cannot be undone.'],
      confirm: 'Delete progress',
    });
    if (ok === null) return;
    this.progress.set({});
    saveProgress({});
  }

  protected write(moduleId: string): void {
    this.writeModule.set(modules.find((m) => m.id === moduleId) ?? null);
    this.draft.set('');
    this.copied.set(false);
    this.screen.set('write');
  }

  protected onDraft(text: string): void {
    this.draft.set(text);
    this.copied.set(false);
  }

  protected async copyPrompt(): Promise<void> {
    const task = this.writeModule()?.writing;
    const text = this.draft().trim();
    if (!task || !text) return;
    try {
      await navigator.clipboard.writeText(tutorPrompt(text, task));
      this.copied.set(true);
    } catch {
      // Clipboard blocked (e.g. no permission): the Ask links still work.
      this.copied.set(false);
    }
  }

  private resetQuestion(): void {
    this.typed.set('');
    this.result.set(null);
    this.hintsShown.set(0);
    this.retrying.set(false);
    this.eliminated.set([]);
    this.reported.set(false);
  }

  private clearTimer(): void {
    clearTimeout(this.advanceTimer);
    this.advanceTimer = undefined;
  }
}
