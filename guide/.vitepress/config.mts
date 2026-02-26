import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Hub Teocrático JW",
    description: "Guía de usuario para el Hub Teocrático JW",
    lang: 'es-ES',
    base: '/Hub-Teocratico-main/guide/', // Adjusted for likely repo name or ensuring relative paths if possible. 
    // actually, if the user's repo is kector71/Hub-Teocratico-main, the base should probably be /Hub-Teocratico-main/guide/
    // But wait, the user's current valid base in vite.config.ts is './'. 
    // VitePress performs better with explicit base if not at root.
    // Let's assume standard GitHub Pages behavior. If the main app is at root, guide is at /guide/.
    // If the main app uses hash router or relative paths, it might work.
    // However, VitePress generates static HTML.
    // Let's try to detect the repo name from the conversation or just use relative base if supported (VitePress support for relative base is tricky).
    // Safe bet: assume it will be at /guide/ of the domain.
    // The user's metadata says [URI] -> kector71/Hub-Teocratico-main. So the repo name is likely Hub-Teocratico-main.
    // So the GHPages URL is username.github.io/Hub-Teocratico-main/
    // So the guide will be at username.github.io/Hub-Teocratico-main/guide/
    // So base should be '/Hub-Teocratico-main/guide/'

    srcDir: '.',
    outDir: '../docs/guide', // Builds to docs/guide relative to site root (guide)

    head: [['link', { rel: 'icon', href: '/Hub-Teocratico-main/favicon.svg' }]],

    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/favicon.svg',

        nav: [
            { text: 'Inicio', link: '/' },
            { text: 'Guía', link: '/getting-started' },
            { text: 'App', link: 'https://kector71.github.io/Hub-Teocratico-main/' }
        ],

        sidebar: [
            {
                text: 'Introducción',
                items: [
                    { text: 'Comenzar', link: '/getting-started' },
                    { text: 'Características', link: '/features' }
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/kector71/Hub-Teocratico-main' }
        ],

        footer: {
            message: 'Creado con ❤️ para la organización.',
            copyright: 'Copyright © 2025 Hub Teocrático JW'
        },

        search: {
            provider: 'local'
        }
    }
})
