#!/bin/bash

set -e
set -x

PACKAGE=$1

if [ -z $PACKAGE ]; then
    echo "Usage: ./tools/build-package.sh <PACKAGE>"
    exit 1
fi


cd deno

cd packages/$PACKAGE
VERSION=$(deno task --quiet version)
cd -

echo "Building package: $PACKAGE $VERSION"

docker build \
    --target package \
    --build-arg "APP_ENV=env.prod" \
    --build-arg "PACKAGE=$PACKAGE" \
    --tag jam/$PACKAGE:$VERSION \
    .

# APP_ENV=env.prod VERSION=$VERSION docker compose -f compose/dev/docker-compose.yml build $PACKAGE
# docker tag ghcr.io/vacavaca/stakan/$PACKAGE:$VERSION ghcr.io/vacavaca/stakan/$PACKAGE:latest
# docker push ghcr.io/vacavaca/stakan/$PACKAGE:$VERSION
# docker push ghcr.io/vacavaca/stakan/$PACKAGE:latest

