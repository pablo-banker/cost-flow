import { buildServer } from '@entrypoints/http/server';
import type {OrganizationModule} from "./organization.module";
import type {FastifyInstance} from "fastify";

export type HttpModuleDependencies = {
    organization: OrganizationModule;
}

export type HttpModule = {
    server: FastifyInstance;
}

export function buildHttpModule(dependencies: HttpModuleDependencies): HttpModule {
    const server = buildServer(dependencies);

    return {
        server,
    };
}