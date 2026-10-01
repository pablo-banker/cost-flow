import {getConfig} from '@config/config';

export function getAwsClientConfig() {
    const config = getConfig();

    if (!config.aws.endpoint) {
        return {
            region: config.aws.region,
        };
    }

    return {
        region: config.aws.region,
        endpoint: config.aws.endpoint,
        credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test',
        },
    };
}