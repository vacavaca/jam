
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
    --tag jam/$PACKAGE:$VERSION \
    .

