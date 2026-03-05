---
order: -304
title: Docker (BETA)
description: Run Kameleo in a Windows-based Docker container, persist data, configure via environment variables, and expose the Local API.
permalink: /integrations/docker
---

Run Kameleo inside a Windows-based Docker container when you need an easily reproducible, isolated environment (CI, ephemeral workers, remote hosts) while still exposing the Local API on your host.

## Prerequisites

- Docker compatible [Windows host OS](https://learn.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/version-compatibility)
- Basic Docker experience (running containers, mounting volumes, using compose files)
- Valid Kameleo account credentials (email & password)

!!!warning Host OS compatibility
The [Kameleo image](https://hub.docker.com/r/kameleo/kameleo-app) is built from the _Windows Server Core LTSC 2022_ base image. You must run it on a host that supports Windows containers: Windows 11, Windows Server 2022, or Windows Server 2025.
!!!

## Container layout & persistence

Kameleo runs under the built‑in, non‑administrative Windows account `ContainerUser` inside the image (not `Administrator`). This improves isolation and reduces the surface for privilege escalation.

Inside the container application data (profiles, kernels) resides at `C:\data` directory. Mount this path to a host directory to persist state across container recreations.

!!!tip Persisting data
If you don't mount the volume, every new container starts empty. Kameleo has to download all kernels again, which is slower and uses more bandwidth. Kernel downloads are rate limited, so starting many containers without mounted volume can hit the limit and make startup fail.
!!!

## Configuration methods

You can configure Kameleo inside the container using the same precedence described in [Configure](../01-getting-started/03-configure.md). In container workflows you typically rely on environment variables or command-line flags appended to `docker run`.

Accepted environment variable names mirror the CLI keys with uppercase; see the full list and defaults in [Configuration options](../05-reference/04-configuration-options.md).

Mandatory credentials must always be provided, without them the app will not authenticate and container startup will fail.

## Steps

### 1. Create a host directory for data

Example (PowerShell on host):

```powershell
New-Item -ItemType Directory -Path "C:\kameleo-data" -Force | Out-Null
```

### 2. Run the container

Expose port 5050, pass credentials, and mount persistent data:

```powershell
docker pull kameleo/kameleo-app:latest
docker run -p 5050:5050 -e EMAIL="email" -e PASSWORD="pw" -v "C:\kameleo-data:C:\data" kameleo/kameleo-app:latest
```

Alternatively use command-line flags (equivalent outcome):

```powershell
docker pull kameleo/kameleo-app:latest
docker run -p 5050:5050 -v "C:\kameleo-data:C:\data" kameleo/kameleo-app:latest email=email password=pw
```

### 3. Verify the service

Open in a browser on the host and expect the Swagger UI to load:

```text
http://localhost:5050/swagger
```

## Example with docker-compose

Use `docker-compose.yml` for repeatable infrastructure or CI pipelines:

```yaml
services:
    kameleo-app:
        image: kameleo/kameleo-app:latest
        ports:
            - "5050:5050"
        environment:
            EMAIL: your-email@example.com
            PASSWORD: your-password
        volumes:
            - C:\kameleo-data:C:\data
        restart: unless-stopped
```

## Health checks

The published image already defines a `HEALTHCHECK` that periodically queries the `/general/healthcheck` endpoint and marks the container as `healthy` once Kameleo is responsive. Nothing extra is required; the health status is visible via the `State` column:

```powershell
docker ps
```

If you build a custom derivative image (e.g., adding tools) and replace the base `CMD`, ensure you keep or re-add a healthcheck so orchestrators wait for readiness.

## AWS ECS Support

Kameleo Docker containers are compatible with **AWS ECS (Elastic Container Service) using EC2 capacity providers**. This allows you to deploy Kameleo in a managed, scalable environment on AWS infrastructure while maintaining the Windows container requirements.

When deploying to AWS ECS with EC2:

- Ensure your EC2 instances support Windows containers (Windows Server 2022 or compatible)
- Use EC2 capacity providers rather than Fargate, as Fargate doesn't support Windows containers with volumes
- Configure appropriate instance types with sufficient resources for your Kameleo workload
- Mount persistent storage using bind mounts to preserve profile data across container restarts
