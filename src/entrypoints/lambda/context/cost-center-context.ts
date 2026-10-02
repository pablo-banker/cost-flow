import {getAppDataSource} from '@infrastructure/persistence/typeorm/data-source';

import {buildPersistenceModule} from '@modules/persistence.module';
import {
    buildCostCenterModule,
    type CostCenterModule,
} from '@modules/cost-center.module';

let costCenterModule: CostCenterModule | undefined;

export async function getCostCenterModule(): Promise<CostCenterModule> {
    if (costCenterModule) {
        return costCenterModule;
    }

    const dataSource = await getAppDataSource();

    const persistenceModule = buildPersistenceModule({
        driver: 'typeorm',
        dataSource,
    });

    costCenterModule = buildCostCenterModule({
        organizationRepository: persistenceModule.organizationRepository,
        unitRepository: persistenceModule.unitRepository,
        costCenterRepository: persistenceModule.costCenterRepository,
    });

    return costCenterModule;
}
