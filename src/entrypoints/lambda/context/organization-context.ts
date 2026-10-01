import {getAppDataSource} from '@infrastructure/persistence/typeorm/data-source';

import {buildPersistenceModule} from '@modules/persistence.module';
import {buildOrganizationModule, type OrganizationModule} from '@modules/organization.module';

let organizationModule: OrganizationModule | undefined;

export async function getOrganizationModule(): Promise<OrganizationModule> {
    if (organizationModule) {
        return organizationModule;
    }

    const dataSource = await getAppDataSource();

    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }

    const persistenceModule = buildPersistenceModule({
        driver: 'typeorm',
        dataSource: dataSource,
    });

    organizationModule = buildOrganizationModule({
        organizationRepository: persistenceModule.organizationRepository,
    });

    return organizationModule;
}