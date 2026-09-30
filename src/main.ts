import {buildAppModule} from "@modules/app.module";

async function main() {
    const app = buildAppModule()

    try {
        await app.server.listen({
            port: 3000,
            host: '0.0.0.0'
        });

        console.log(`Server started on port 3000`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();