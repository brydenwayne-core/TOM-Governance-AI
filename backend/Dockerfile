# Online installation is the portable default. The offline target accepts a trusted,
# separately downloaded wheelhouse for environments where build containers have no egress.
ARG DEPENDENCY_SOURCE=online
FROM python:3.12-slim AS base
WORKDIR /srv
COPY backend/requirements.lock /srv/requirements.lock

FROM base AS online
RUN pip install --no-cache-dir -r requirements.lock

FROM base AS offline
COPY --from=wheelhouse / /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.lock && rm -rf /wheels

FROM ${DEPENDENCY_SOURCE} AS runtime
COPY --chown=10001:10001 backend /srv/backend
COPY --chown=10001:10001 governance /srv/governance
COPY --chown=10001:10001 docs/organization/mock /srv/docs/organization/mock
RUN useradd --uid 10001 --create-home tom && install -d -m 0700 -o tom -g tom /srv/.data
USER tom
WORKDIR /srv/backend
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
