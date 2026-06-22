const SignIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="18" width="40" height="28" rx="3" fill="rgba(6, 182, 212, 0.15)" stroke="#06B6D4" />
    <rect x="8" y="14" width="48" height="36" rx="4" stroke="#EC4899" />
    <path d="M16 28h32" stroke="#EAB308" />
    <path d="M24 38h16" stroke="#EAB308" />
  </svg>
);

const ArchIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 58V30C12 18 20 10 32 10s20 8 20 20v28Z" fill="rgba(59, 130, 246, 0.12)" stroke="#3B82F6" />
    <path d="M6 58h12M46 58h12" stroke="#64748B" />
  </svg>
);

const WallIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="10" width="44" height="40" rx="2" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" />
  </svg>
);

const FurnitureIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="12" width="28" height="22" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" />
    <path d="M12 34h40v6H12z" stroke="#D97706" fill="rgba(251, 191, 36, 0.2)" />
  </svg>
);

const CakeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="26" width="32" height="18" fill="rgba(245, 208, 254, 0.3)" stroke="#D946EF" />
    <path d="M12 44h40v10H12z" stroke="#6366F1" fill="rgba(99, 102, 241, 0.15)" />
  </svg>
);

const FloralIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="24" r="14" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" />
    <circle cx="32" cy="24" r="5" fill="#FBBF24" stroke="#FBBF24" />
  </svg>
);

const LightingIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="20" r="10" fill="rgba(253, 224, 71, 0.3)" stroke="#EAB308" />
    <path d="M32 30v18" stroke="#D97706" />
    <path d="M20 48h24" stroke="#D97706" />
  </svg>
);

const AudioIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="8" width="32" height="48" rx="4" fill="rgba(79, 70, 229, 0.12)" stroke="#4F46E5" />
    <circle cx="32" cy="42" r="10" stroke="#06B6D4" fill="rgba(6, 182, 212, 0.1)" />
  </svg>
);

const SpecialIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="22" r="12" fill="rgba(236, 72, 153, 0.15)" stroke="#EC4899" />
    <path d="M32 34c0 6-6 10-6 10" stroke="#475569" />
  </svg>
);

export function getItemIcon(title) {
  const t = String(title || "").toLowerCase();
  if (t.includes("neon") || t.includes("sign") || t.includes("board") || t.includes("number")) {
    return <SignIcon />;
  }
  if (t.includes("arch") || t.includes("frame") || t.includes("mandap")) {
    return <ArchIcon />;
  }
  if (t.includes("wall") || t.includes("curtain") || t.includes("drap") || t.includes("backdrop")) {
    return <WallIcon />;
  }
  if (t.includes("chair") || t.includes("sofa") || t.includes("table") || t.includes("bench")) {
    return <FurnitureIcon />;
  }
  if (t.includes("cake") || t.includes("cupcake") || t.includes("platter") || t.includes("display")) {
    return <CakeIcon />;
  }
  if (t.includes("flower") || t.includes("floral") || t.includes("balloon")) {
    return <FloralIcon />;
  }
  if (t.includes("light") || t.includes("candle") || t.includes("led") || t.includes("chandelier")) {
    return <LightingIcon />;
  }
  if (t.includes("speaker") || t.includes("audio") || t.includes("sound")) {
    return <AudioIcon />;
  }
  return <SpecialIcon />;
}
