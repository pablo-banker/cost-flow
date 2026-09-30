import 'dotenv/config';

function requiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `Environment variable '${name}' is required`,
        );
    }

    return value;
}

function numberEnv(name: string, defaultValue: number,): number {
    const value = process.env[name];

    if (!value) {
        return defaultValue;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
        throw new Error(
            `Environment variable '${name}' must be a number`,
        );
    }

    return parsed;
}

export type AppConfig = {
    nodeEnv: string;
    port: number;
};

export type DatabaseConfig = {
    url: string;
    poolSize: number;
};

export function getAppConfig(): AppConfig {
    return {
        nodeEnv: process.env.NODE_ENV ?? 'development',
        port: numberEnv('PORT', 3000),
    };
}

export function getDatabaseConfig(): DatabaseConfig {
    return {
        url: requiredEnv('DATABASE_URL'),
        poolSize: numberEnv(
            'DATABASE_POOL_SIZE',
            5,
        ),
    };
}