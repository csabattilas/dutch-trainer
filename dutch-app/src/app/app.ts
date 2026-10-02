import { Component, computed, signal } from '@angular/core';
import { autoAdvanceDelay, grade } from './core/answer';
import { buildSession } from './core/session';
import { DELAYS, loadSettings, saveSettings, SIZES, type Settings } from './core/settings';
import { review, type Progress } from './core/srs';
import { loadProgress, saveProgress } from './core/storage';
import { askUrls, tutorPrompt } from './core/tutor-prompt';
import type { Exercise, ExerciseModule } from './core/types';
import { modules } from './modules/registry';
import { ChoiceButtons, Feedback, Hint, TextArea, TextInput, WordBank, WordTiles } from './ui';

type Screen = 'menu' | 'quiz' | 'done' | 'write' | 'settings';

@Component({
  imports: [ChoiceButtons, Feedback, Hint, TextArea, TextInput, WordBank, WordTiles],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly sizes = SIZES;
  protected readonly delays = DELAYS;
  protected readonly screen = signal<Screen>('menu');
  protected readonly settings = signal<Settings>(loadSettings());
  protected readonly progress = signal<Progress>(loadProgress());

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

  protected resetProgress(): void {
    if (!confirm('Delete all your progress? This cannot be undone.')) return;
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
  }

  private clearTimer(): void {
    clearTimeout(this.advanceTimer);
    this.advanceTimer = undefined;
  }
}
