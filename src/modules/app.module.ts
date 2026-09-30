import {buildPersistenceModule, type PersistenceModuleDependencies} from "./persistence.module";
import {buildHttpModule} from "@modules/http.module";
import {buildOrganizationModule} from "@modules/organization.module";

type AppModuleDependencies = {
    persistence?: PersistenceModuleDependencies;
};


export async function buildAppModule({ persistence }: AppModuleDependencies = {}) {
    const persistenceModule = buildPersistenceModule(persistence);

    const organizationModule = buildOrganizationModule({
        organizationRepository: persistenceModule.organizationRepository
    });

    const httpModule = await buildHttpModule({
        organization: organizationModule
    });

    return {
        server: httpModule.server
    }
}