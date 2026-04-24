export const FREE_EXPORTS_PER_WEEK = 5;
export const AD_DURATION_SECONDS = 20;
export const EXPORT_TOKEN_EXPIRY_SECONDS = 600; // 10 minutes

export const PLANS = {
  free: {
    name: "Free",
    exportsPerWeek: FREE_EXPORTS_PER_WEEK,
    hasAd: true,
    hasCreatorSearch: false,
  },
  pro: {
    name: "Pro",
    exportsPerWeek: Infinity,
    hasAd: false,
    hasCreatorSearch: true,
  },
} as const;
