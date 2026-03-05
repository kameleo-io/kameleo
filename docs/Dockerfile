FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder
WORKDIR /build

COPY retype.yml ./
COPY ./docs ./docs

RUN dotnet tool install retypeapp --tool-path /bin

RUN --mount=type=secret,id=retype_key \
    retype build --strict --verbose --output .docker-build/ --key $(cat /run/secrets/retype_key)

FROM nginx:1.29-alpine-slim AS runtime

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /build/.docker-build/ /usr/share/nginx/html

COPY ./docs/nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK CMD test -f /usr/share/nginx/html/index.html || exit 1
