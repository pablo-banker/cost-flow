import Fastify from 'fastify'
import type {HttpModuleDependencies} from "@modules/http.module";

import {registerSwagger} from "@entrypoints/http/swagger";
import {registerOrganizationRoutes} from "@entrypoints/http/routes/organization-routes";
import {registerSystemRoutes} from "@entrypoints/http/routes/system-routes";


export async function buildServer(dependencies: HttpModuleDependencies,) {
    const server = Fastify();

    await registerSwagger(server);

    registerSystemRoutes(
        server
    );

    registerOrganizationRoutes(
        server,
        dependencies.organization,
    );

    return server;
}