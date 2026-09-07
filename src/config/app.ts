/**
 * Static, edit-in-source configuration. Anything the admin can change
 * at runtime (app name, description, platforms, socials) lives in the
 * database instead — see src/lib/db/settings.ts and /admin/settings.
 * This file only holds content that isn't meant to be edited live.
 */

export type Feature = { icon: string; title: string; description: string };

export const FEATURES: Feature[] = [
  { icon: "Radio", title: "Music streaming", description: "Play your tracks instantly without waiting around for downloads to finish first." },
  { icon: "Search", title: "Fast search", description: "Find any song, artist, or album in your library in a couple of keystrokes." },
  { icon: "ListMusic", title: "Playlists", description: "Group songs into playlists that match your mood, your workout, or your commute." },
  { icon: "Heart", title: "Favorites", description: "Mark the tracks you keep coming back to and get to them in one click." },
  { icon: "SlidersHorizontal", title: "Modern player", description: "A clean playback bar with the controls you actually use, and none you don't." },
  { icon: "Zap", title: "Fast performance", description: "Built to stay light on resources, even with a large library loaded." },
  { icon: "Moon", title: "Dark mode", description: "An interface designed for dark mode first, easy on the eyes during long sessions." },
  { icon: "User", title: "Personalized experience", description: "Your library, your playlists, your favorites — organized the way you like it." },
];

export type Screenshot = { src: string; alt: string; caption: string };

export const SCREENSHOTS: Screenshot[] = [
  { src: "/screenshots/placeholder-library.png", alt: "Tunify library view showing a list of songs", caption: "Your library" },
  { src: "/screenshots/placeholder-player.png", alt: "Tunify now-playing screen with playback controls", caption: "Now playing" },
  { src: "/screenshots/placeholder-playlists.png", alt: "Tunify playlists screen", caption: "Playlists" },
];

export const INSTALLATION_STEPS: { title: string; description: string }[] = [
  { title: "Download Tunify", description: "Grab the latest installer from the download section above." },
  { title: "Open the downloaded file", description: "Locate the file in your downloads folder and open it." },
  { title: "Follow the installation instructions", description: "Walk through the setup steps until installation finishes." },
  { title: "Launch Tunify and start listening", description: "Open the app, load your library, and press play." },
];

export type FaqItem = { question: string; answer: string };

export const FAQ_ITEMS: FaqItem[] = [
  { question: "What is Tunify?", answer: "Tunify is a modern music player for streaming and organizing your music library, with a focus on speed and a clean, distraction-free interface." },
  { question: "Is Tunify free?", answer: "REPLACE_ME — state your actual pricing here (e.g. free, free with a paid tier, one-time purchase)." },
  { question: "Which platforms are supported?", answer: "__DYNAMIC_PLATFORMS__" },
  { question: "How do I download Tunify?", answer: "Use the \"Download Tunify\" button at the top of this page or in the Download section to get the latest version." },
  { question: "How often is Tunify updated?", answer: "REPLACE_ME — describe your actual release cadence here (e.g. monthly, as features are ready)." },
];

export const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Features", href: "/#features" },
  { label: "Download", href: "/#download" },
  { label: "Releases", href: "/releases" },
  { label: "FAQ", href: "/#faq" },
];

export const LEGAL_LINKS = {
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",
};
