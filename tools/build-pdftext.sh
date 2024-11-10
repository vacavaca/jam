
#!/bin/bash

set -e
set -x

cd python

PACKAGE="pdftext"
VERSION=$(cat packages/pdftext/.version)

echo "Building pdftext: $VERSION"

docker build \
    --target pdftext \
    --build-arg "APP_ENV=env.prod" \
    --tag ghcr.io/vacavaca/jam/$PACKAGE:$VERSION \
    .

docker tag ghcr.io/vacavaca/jam/$PACKAGE:$VERSION ghcr.io/vacavaca/jam/$PACKAGE:latest
docker push ghcr.io/vacavaca/jam/$PACKAGE:$VERSION
docker push ghcr.io/vacavaca/jam/$PACKAGE:latest
