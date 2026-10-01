#!/bin/sh

set -eu

SECRET_ID="cost-flow/local/app"

SECRET_STRING=$(python3 - <<'PY'
import json
import os

print(json.dumps({
    "database": {
        "username": os.environ["POSTGRES_USER"],
        "password": os.environ["POSTGRES_PASSWORD"],
    }
}))
PY
)

if awslocal secretsmanager describe-secret \
    --secret-id "$SECRET_ID" \
    > /dev/null 2>&1
then
    awslocal secretsmanager put-secret-value \
        --secret-id "$SECRET_ID" \
        --secret-string "$SECRET_STRING"
else
    awslocal secretsmanager create-secret \
        --name "$SECRET_ID" \
        --secret-string "$SECRET_STRING"
fi