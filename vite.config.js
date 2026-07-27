import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
    plugins: [
        tailwindcss(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
        {
            name: 'copy-public-to-dist-for-vercel',
            closeBundle() {
                try {
                    fs.cpSync(path.resolve(__dirname, 'public'), path.resolve(__dirname, 'dist'), { recursive: true });
                    console.log('✓ Successfully mirrored public to dist for Vercel');
                } catch (err) {
                    console.error('Failed to copy public to dist:', err);
                }
            }
        }
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    server: {
        host: '127.0.0.1',
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
