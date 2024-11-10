# =======================
# builder
#
# builds all the common libraries
# =======================

from denoland/deno:debian as builder

ARG PACKAGE=""
ARG APP_ENV=env

ADD deno.jsonc /jam/
ADD deno.lock /jam/
ADD packages/common/deno.json /jam/packages/common/deno.json
ADD packages/serve/deno.json /jam/packages/serve/deno.json
ADD packages/api/deno.json /jam/packages/api/deno.json
ADD packages/comprehender/deno.json /jam/packages/comprehender/deno.json

WORKDIR /jam
RUN deno install --frozen=true

# =======================
# package
#
# =======================

from denoland/deno:debian as package

ARG PACKAGE=""
ARG APP_ENV=env

COPY --from=builder /deno-dir /deno-dir

ADD deno.jsonc /jam/
ADD deno.lock /jam/
ADD packages/common /jam/packages/common
ADD packages/serve /jam/packages/serve
ADD packages/comprehender /jam/packages/comprehender
ADD packages/api /jam/packages/api
ADD packages/${PACKAGE}/.${APP_ENV} /jam/packages/${PACKAGE}/.env

WORKDIR /jam/packages/${PACKAGE}
CMD deno task --quiet prod

# =======================
# pdftext
#
# =======================

from python:bookworm as pdftext

ARG APP_ENV=env

ADD packages/pdftext/requirements.txt /pdftext/requirements.txt
WORKDIR /pdftext

RUN python -m pip install -r ./requirements.txt

ADD packages/pdftext/src /pdftext/src
ADD packages/pdftext/.${APP_ENV} /pdftext/.env

CMD set -a && . ./.env && python ./src/start.py
