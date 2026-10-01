import localConfig from './local.json';
import localHostConfig from './local-host.json';
import devConfig from './dev.json';
import prodConfig from './prod.json';

export type AppEnvironment =
    | 'local'
    | 'local-host'
    | 'dev'
    | 'prod';

export type AppConfig = {
    app: {
        nodeEnv: string;
    };
    database: {
        host: string;
        port: number;
        name: string;
        poolSize: number;
    };
    valkey: {
        host: string;
        port: number;
    };
    aws: {
        region: string;
        endpoint: string | null;
    };
    secrets: {
        appSecretId: string;
    };
    storage: {
        invoiceBucket: string;
    };
    queues: {
        invoiceProcessing: string;
        invoiceProcessingDlq: string;
    };
};

const configs: Record<AppEnvironment, AppConfig> = {
    local: localConfig,
    'local-host': localHostConfig,
    dev: devConfig,
    prod: prodConfig,
};

export function getConfig(): AppConfig {
    const environment = process.env.APP_ENV;

    if (!environment) {
        throw new Error('APP_ENV is required');
    }

    if (!(environment in configs)) {
        throw new Error(`Invalid APP_ENV '${environment}'`);
    }

    return configs[environment as AppEnvironment];
}