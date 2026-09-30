import Fastify from 'fastify'
import {registerOrganizationRoutes} from "@entrypoints/http/routes/organization-routes";

import type {HttpModuleDependencies} from "@modules/http.module";

export function buildServer(dependencies: HttpModuleDependencies,) {
    const server = Fastify();

    server.get('/health', async () => {
        return {
            status: 'ok',
        };
    });

    registerOrganizationRoutes(
        server,
        dependencies.organization,
    );

    return server;
}