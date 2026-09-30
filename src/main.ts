import {appDataSource} from "@infrastructure/persistence/typeorm/data-source";
import {getAppConfig} from "@config/env";
import {buildAppModule} from "@modules/app.module";

async function bootstrap(): Promise<void> {
    const config = getAppConfig();

    await appDataSource.initialize();

    const app = await buildAppModule({
        persistence: {
            driver: 'typeorm',
            dataSource: appDataSource,
        },
    });

    await app.server.listen({
        port: config.port,
        host: '0.0.0.0',
    });
}

bootstrap().catch(error => {
    console.error(error);
    process.exit(1);
});