import type { Bi, Doc } from "../types";
import { hub } from "./hub";
import { delivery } from "./delivery";
import { returns } from "./returns";
import { selling } from "./selling";
import { contact } from "./contact";

export { hub, contact };

// The pages under /help/[slug].
export const HELP_PAGES: Record<string, Bi<Doc>> = { delivery, returns, selling };
export const HELP_SLUGS = Object.keys(HELP_PAGES);
