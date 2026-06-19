// Professional SVG shape icons for answer options (Kahoot-style)
// Clean geometric shapes instead of cartoon emojis

export const TriangleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L22 20H2L12 3Z" />
  </svg>
);

export const DiamondIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L22 12L12 22L2 12L12 2Z" />
  </svg>
);

export const CircleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export const SquareIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

// Trophy icon for leaderboard/winners
export const TrophyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

// Crown icon for first place
export const CrownIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 18h20l-2-9-5 4-3-7-3 7-5-4z" />
    <rect x="2" y="19" width="20" height="2" rx="1" />
  </svg>
);

// Flame icon for streaks
export const FlameIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 7 6 7 12C7 14.5 8.5 17 12 17C15.5 17 17 14.5 17 12C17 11 16.5 10 16.5 10C16.5 10 16 11 15 11C15 8 12 2 12 2Z" />
    <path d="M12 22C9 22 6 20 6 16C6 14 7 12.5 7 12.5C7 15 9 16 9 16C9 16 8.5 14 10 12C10 14 14 15 14 18C14 20.5 12 22 12 22Z" opacity="0.7" />
  </svg>
);

// Users/people icon
export const UsersIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// Clock icon for timer
export const ClockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Check icon for correct
export const CheckIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// X icon for incorrect
export const XIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Lightning bolt for speed bonus
export const BoltIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
);

// Array of shape icons in order for answer options
export const OPTION_SHAPES = [TriangleIcon, DiamondIcon, CircleIcon, SquareIcon];

// Shape colors matching the icons (Kahoot-style)
export const OPTION_COLORS = ['#E21B3C', '#1368CE', '#D89E00', '#26890C'];
export const OPTION_BG_CLASSES = ['bg-game-red', 'bg-game-blue', 'bg-game-yellow', 'bg-game-green'];
