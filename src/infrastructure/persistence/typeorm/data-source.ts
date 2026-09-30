import 'reflect-metadata';

import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '@config/env';
import {OrganizationOrmEntity} from "@infrastructure/persistence/typeorm/entities/organization.orm-entity";

const databaseConfig = getDatabaseConfig();

export const appDataSource = new DataSource({
    type: 'postgres',
    url: databaseConfig.url,
    poolSize: databaseConfig.poolSize,
    synchronize: false,
    migrationsRun: false,
    entities: [
        OrganizationOrmEntity
    ],
    migrations: [],
    logging: false,
});