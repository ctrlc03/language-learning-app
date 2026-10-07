import { shuffle } from '@/lib/tones/utils';
import { GENERAL, distractorPool, geIsWrong, type MwItem } from './data';

const OPTION_COUNT = 4;
/** Chance that a second correct classifier is shown alongside the first. */
const ALTERNATE_CHANCE = 0.4;
/**
 * Chance that 个 is offered as a wrong answer where it is clearly wrong. Keeps
 * 个 from being a tell: it shows up as a distractor about as often as it is
 * a correct option (a fifth of nouns take it, a third of the rest reject it).
 */
const GE_DISTRACTOR_CHANCE = 0.35;

/**
 * Four options: the taught classifier, sometimes one other correct one, and
 * the rest drawn only from classifiers that are wrong for the noun. Any
 * correct option may be picked, so an alternative never counts as a distractor.
 */
export function buildOptions(item: MwItem, rng: () => number): string[] {
  const [primary, ...alternatives] = item.classifiers;
  const correct = [primary];
  if (alternatives.length > 0 && rng() < ALTERNATE_CHANCE) {
    correct.push(alternatives[Math.floor(rng() * alternatives.length)]);
  }
  const wrong = shuffle(distractorPool(item), rng);
  if (geIsWrong(item) && rng() < GE_DISTRACTOR_CHANCE) wrong.unshift(GENERAL);
  return shuffle([...correct, ...wrong.slice(0, OPTION_COUNT - correct.length)], rng);
}
