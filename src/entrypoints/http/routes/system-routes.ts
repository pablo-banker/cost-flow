import type {FastifyInstance} from "fastify";
import {
    healthHandler,
    healthSchema
} from "@entrypoints/http/handlers";

export function registerSystemRoutes(server: FastifyInstance) {
    server.get(
        '/health',
        {
            schema: healthSchema,
        },
        healthHandler(),
    );
}