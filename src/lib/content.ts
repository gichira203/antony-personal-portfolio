import { db } from "./db";
import {
  CONTENT_SECTIONS,
  defaultSiteContent,
  isContentSection,
  type ContentSection,
  type SiteContent,
} from "@/data/siteContentDefaults";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Merge a stored section over its default. Plain objects merge recursively so
 * adding a new field to the defaults never breaks an older saved section;
 * arrays (lists of skills, services, etc.) are replaced wholesale.
 */
function mergeValue<T>(fallback: T, override: unknown): T {
  if (override === undefined || override === null) return fallback;
  if (Array.isArray(fallback)) {
    return (Array.isArray(override) ? override : fallback) as T;
  }
  if (isPlainObject(fallback) && isPlainObject(override)) {
    const merged: Record<string, unknown> = { ...fallback };
    for (const key of Object.keys(override)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      if (key in fallback) {
        merged[key] = mergeValue(
          (fallback as Record<string, unknown>)[key],
          override[key]
        );
      }
    }
    return merged as T;
  }
  return (typeof override === typeof fallback ? override : fallback) as T;
}

/** Read all content sections, falling back to the built-in defaults. */
export async function getSiteContent(): Promise<SiteContent> {
  let overrides: Record<string, unknown> = {};
  try {
    overrides = await db.content.getAll();
  } catch (err) {
    console.error("[content] failed to load saved content:", err);
  }

  const merged = { ...defaultSiteContent } as SiteContent;
  for (const section of CONTENT_SECTIONS) {
    if (overrides[section] !== undefined) {
      (merged as unknown as Record<string, unknown>)[section] = mergeValue(
        defaultSiteContent[section],
        overrides[section]
      );
    }
  }
  return merged;
}

export async function saveContentSection(
  section: ContentSection,
  value: unknown
): Promise<void> {
  if (!isContentSection(section)) {
    throw new Error("Unknown content section");
  }
  await db.content.set(section, value);
}
