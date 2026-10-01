import {
    GetSecretValueCommand,
    SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

import {getConfig} from '@config/config';

import {getAwsClientConfig} from '@infrastructure/aws/aws-client-config';

export type AppSecrets = {
    database: {
        username: string;
        password: string;
    };
};

let secretsManagerClient: SecretsManagerClient | undefined;
let cachedAppSecrets: AppSecrets | undefined;

function getSecretsManagerClient(): SecretsManagerClient {
    if (!secretsManagerClient) {
        secretsManagerClient = new SecretsManagerClient(getAwsClientConfig());
    }

    return secretsManagerClient;
}

function parseAppSecrets(secretId: string, secretString: string): AppSecrets {
    let parsed: unknown;

    try {
        parsed = JSON.parse(secretString);
    } catch {
        throw new Error(`Secret '${secretId}' must contain valid JSON`);
    }

    const secret = parsed as {
        database?: {
            username?: unknown;
            password?: unknown;
        };
    };

    if (typeof secret.database?.username !== 'string') {
        throw new Error(`Secret '${secretId}' is missing database.username`);
    }

    if (typeof secret.database.password !== 'string') {
        throw new Error(`Secret '${secretId}' is missing database.password`);
    }

    return {
        database: {
            username: secret.database.username,
            password: secret.database.password,
        },
    };
}

export async function getAppSecrets(): Promise<AppSecrets> {
    if (cachedAppSecrets) {
        return cachedAppSecrets;
    }

    const config = getConfig();

    const response = await getSecretsManagerClient().send(new GetSecretValueCommand({
        SecretId: config.secrets.appSecretId,
    }));

    if (!response.SecretString) {
        throw new Error(`Secret '${config.secrets.appSecretId}' has no SecretString`);
    }

    cachedAppSecrets = parseAppSecrets(
        config.secrets.appSecretId,
        response.SecretString,
    );

    return cachedAppSecrets;
}