import { buildServer } from '@entrypoints/http/server';
import type {OrganizationModule} from "./organization.module";
import type {FastifyInstance} from "fastify";

export type HttpModuleDependencies = {
    organization: OrganizationModule;
}

export type HttpModule = {
    server: FastifyInstance;
}

export async function buildHttpModule(dependencies: HttpModuleDependencies): Promise<HttpModule> {
    const server = await buildServer(dependencies);

    return {
        server,
    };
}