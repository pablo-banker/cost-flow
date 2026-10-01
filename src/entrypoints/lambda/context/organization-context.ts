import {appDataSource} from '@infrastructure/persistence/typeorm/data-source';

import {buildPersistenceModule} from '@modules/persistence.module';
import {buildOrganizationModule, type OrganizationModule} from '@modules/organization.module';

let organizationModule: OrganizationModule | undefined;

export async function getOrganizationModule(): Promise<OrganizationModule> {
    if (organizationModule) {
        return organizationModule;
    }

    if (!appDataSource.isInitialized) {
        await appDataSource.initialize();
    }

    const persistenceModule = buildPersistenceModule({
        driver: 'typeorm',
        dataSource: appDataSource,
    });

    organizationModule = buildOrganizationModule({
        organizationRepository: persistenceModule.organizationRepository,
    });

    return organizationModule;
}