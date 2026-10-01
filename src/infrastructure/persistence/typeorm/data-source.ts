import 'reflect-metadata';

import {DataSource} from 'typeorm';

import {getConfig} from '@config/config';

import {getAppSecrets} from '@infrastructure/aws/secrets/secrets-manager';
import {OrganizationOrmEntity} from '@infrastructure/persistence/typeorm/entities/organization.orm-entity';

let appDataSourcePromise: Promise<DataSource> | undefined;

export async function createTypeOrmDataSource(): Promise<DataSource> {
    const config = getConfig();
    const secrets = await getAppSecrets();

    return new DataSource({
        type: 'postgres',

        host: config.database.host,
        port: config.database.port,
        database: config.database.name,

        username: secrets.database.username,
        password: secrets.database.password,

        poolSize: config.database.poolSize,

        synchronize: false,
        migrationsRun: false,

        entities: [
            OrganizationOrmEntity,
        ],

        migrations: [
            'src/infrastructure/persistence/typeorm/migrations/*.ts',
        ],

        logging: false,
    });
}

export async function getAppDataSource(): Promise<DataSource> {
    if (!appDataSourcePromise) {
        appDataSourcePromise = (async () => {
            const dataSource = await createTypeOrmDataSource();

            await dataSource.initialize();

            return dataSource;
        })();
    }

    return appDataSourcePromise;
}