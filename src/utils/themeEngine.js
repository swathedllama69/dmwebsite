// src/utils/themeEngine.js

export const THEMES = {
    'devolt-punk': {
        accent: '#CCFF00',
        bg: '#000000',
        card: '#111111',
        headerBg: '#000000',
        headerText: '#FFFFFF',
        headerStyle: 'dark'
    },
    'devolt-chrome': {
        accent: '#1E40AF',
        bg: '#F8F9FA',
        card: '#FFFFFF',
        headerBg: '#FFFFFF',
        headerText: '#000000',
        headerStyle: 'light'
    },
    'night-ops': {
        accent: '#FF4F00',
        bg: '#0D0D0D',
        card: '#1A1A1A',
        headerBg: '#000000',
        headerText: '#FFFFFF',
        headerStyle: 'dark'
    },
    'voltage': {
        accent: '#FF6F61',
        bg: '#FFFFFF',
        card: '#F3F4F6',
        headerBg: '#FFFFFF',
        headerText: '#000000',
        headerStyle: 'light'
    },
    'infinity': {
        accent: '#00F5D4',
        bg: '#050505',
        card: '#111111',
        headerBg: '#000000',
        headerText: '#FFFFFF',
        headerStyle: 'dark'
    }
};

export const FONT_STYLES = {
    'style-a': {
        heading: "'Space Grotesk', sans-serif",
        body: "'JetBrains Mono', monospace"
    },
    'style-b': {
        heading: "'Archivo Black', sans-serif",
        body: "'Plus Jakarta Sans', sans-serif"
    },
    'style-c': {
        heading: "'Cinzel', serif",
        body: "'Inter', sans-serif"
    }
};

export const applyTheme = (themeKey, fontKey) => {
    const theme = THEMES[themeKey] || THEMES['devolt-punk'];
    const font = FONT_STYLES[fontKey] || FONT_STYLES['style-a'];
    const root = document.documentElement;

    // Apply Colors
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--card-bg', theme.card);
    root.style.setProperty('--header-bg', theme.headerBg);
    root.style.setProperty('--header-text', theme.headerText);
    root.style.setProperty('--text-color', theme.headerStyle === 'dark' ? '#FFFFFF' : '#000000');

    // Apply Fonts
    root.style.setProperty('--font-heading', font.heading);
    root.style.setProperty('--font-body', font.body);

    return theme.headerStyle; // Return this to help App.jsx swap the logo
};