import 'reflect-metadata';

import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '@config/env';

const databaseConfig = getDatabaseConfig();

export const appDataSource = new DataSource({
    type: 'postgres',
    url: databaseConfig.url,
    poolSize: databaseConfig.poolSize,
    synchronize: false,
    migrationsRun: false,
    entities: [],
    migrations: [],
    logging: false,
});