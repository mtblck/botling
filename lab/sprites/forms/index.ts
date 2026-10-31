import type { Form } from '../draw.js';
import { EARTH } from './earth.js';
import { FIRE } from './fire.js';
import { SPACE } from './space.js';
import { WATER } from './water.js';
import { WIND } from './wind.js';

/** Every element's forms, by name. */
export const FORMS = { ...FIRE, ...WATER, ...EARTH, ...WIND, ...SPACE } satisfies Record<string, Form>;
export type FormName = keyof typeof FORMS;
