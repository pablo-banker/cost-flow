import {getAppDataSource} from '@infrastructure/persistence/typeorm/data-source';

import {buildPersistenceModule} from '@modules/persistence.module';
import {
    buildUnitModule,
    type UnitModule,
} from '@modules/unit.module';

let unitModule: UnitModule | undefined;

export async function getUnitModule(): Promise<UnitModule> {
    if (unitModule) {
        return unitModule;
    }

    const dataSource = await getAppDataSource();

    const persistenceModule = buildPersistenceModule({
        driver: 'typeorm',
        dataSource,
    });

    unitModule = buildUnitModule({
        organizationRepository: persistenceModule.organizationRepository,
        unitRepository: persistenceModule.unitRepository,
    });

    return unitModule;
}