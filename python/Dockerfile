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
