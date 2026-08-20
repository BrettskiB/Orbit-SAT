export const IMMERSIVE_WORLDS_ENABLED = false;

export type AppearanceMode = "light" | "dark" | "system";
export type StandardLayoutId = "classic" | "coastal" | "graphite";

export type StandardLayout = {
  id: StandardLayoutId;
  name: string;
  description: string;
  accent: string;
  nav: string;
  hue: string;
  recommendedMode: Exclude<AppearanceMode, "system">;
};

export type AppearancePalette = {
  id: string;
  name: string;
  description: string;
  accent: string;
  nav: string;
  hue: string;
};

export const standardLayouts: StandardLayout[] = [
  { id: "classic", name: "Orbit Classic", description: "Warm cream with Orbit coral", accent: "#f4774e", nav: "#111b34", hue: "#f7f5ef", recommendedMode: "light" },
  { id: "coastal", name: "Coastal", description: "Sea glass with deep blue", accent: "#287f91", nav: "#17384a", hue: "#edf6f7", recommendedMode: "light" },
  { id: "graphite", name: "Graphite", description: "Charcoal with crisp cobalt", accent: "#7597ff", nav: "#111622", hue: "#171c25", recommendedMode: "dark" }
];

export const appearancePalettes: AppearancePalette[] = [
  { id: "orbit", name: "Orbit", description: "Coral and navy", accent: "#f4774e", nav: "#111b34", hue: "#f4eee7" },
  { id: "coastal", name: "Coastal", description: "Teal and ocean blue", accent: "#287f91", nav: "#17384a", hue: "#e8f4f4" },
  { id: "cobalt", name: "Cobalt", description: "Electric blue and ink", accent: "#4f72e8", nav: "#15213f", hue: "#eef2ff" },
  { id: "sage", name: "Sage", description: "Green and evergreen", accent: "#54866d", nav: "#1d352c", hue: "#eef5ef" },
  { id: "amber", name: "Amber", description: "Gold and espresso", accent: "#c67b2e", nav: "#3a2922", hue: "#fbf1e3" },
  { id: "violet", name: "Violet", description: "Iris and deep plum", accent: "#8a63d2", nav: "#2a2140", hue: "#f4effc" }
];

export const screenHues = [
  { id: "neutral", name: "Neutral", value: "#f7f5ef" },
  { id: "warm", name: "Warm", value: "#f6e7d8" },
  { id: "cool", name: "Cool", value: "#e8f0fa" },
  { id: "mint", name: "Mint", value: "#e5f3eb" },
  { id: "lilac", name: "Lilac", value: "#eee7f7" }
];

export function isStandardLayout(value: string): value is StandardLayoutId {
  return standardLayouts.some(layout => layout.id === value);
}

export function getStandardLayout(value: string): StandardLayout {
  return standardLayouts.find(layout => layout.id === value) ?? standardLayouts[0];
}

export function normalizeStandardLayout(value: string | null | undefined): StandardLayoutId {
  return value && isStandardLayout(value) ? value : "classic";
}

export function readableTextColor(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map(character => character + character).join("")
    : normalized.padEnd(6, "0").slice(0, 6);
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.58 ? "#101727" : "#ffffff";
}
