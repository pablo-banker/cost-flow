import {defineConfig} from 'vitest/config';

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },

    test: {
        env: {
            APP_ENV: 'local-host',
        },

        include: [
            'tests/integration/**/*.test.ts',
        ],

        fileParallelism: false,
    },
});