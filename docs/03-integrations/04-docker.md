---
order: -304
title: Docker (BETA)
description: Run Kameleo in a Docker container on Windows or Linux, persist data, configure via environment variables, and expose the Local API.
permalink: /integrations/docker
---

This guide shows you how to run Kameleo inside a Docker container and expose the Local API on your host. Use the containerized deployment when you need an isolated, reproducible environment — for example, in CI pipelines, ephemeral workers, or remote hosts.

The [`kameleo/kameleo-app:latest`](https://hub.docker.com/r/kameleo/kameleo-app) image is a multi-platform manifest covering both Windows (Server Core LTSC 2022) and Linux (Ubuntu 22.04). Docker automatically pulls the variant that matches your host OS, no separate tags are needed.

## Prerequisites

+++ Windows-based container

- Docker compatible [Windows host OS](https://learn.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/version-compatibility)
- Basic Docker experience (running containers, mounting volumes, using compose files)
- Valid Kameleo account credentials (email & password)

!!!warning Host OS compatibility
The Windows variant is built from the _Windows Server Core LTSC 2022_ base image. You must run it on a host that supports Windows containers: Windows 11, Windows Server 2022, or Windows Server 2025.
!!!

+++ Linux-based container

- Any Docker-capable Linux host (amd64 architecture)
- Basic Docker experience (running containers, mounting volumes, using compose files)
- Valid Kameleo account credentials (email & password)

!!!warning Shared memory size
Always start the Linux container with `--shm-size=2g`. The default `/dev/shm` size of 64 MB is too small and will cause browser crashes.
!!!

+++

## Container layout & persistence

Kameleo runs under a non-administrative user inside the image. This improves isolation and reduces the surface for privilege escalation.

| Property           | Windows                               | Linux                          |
| ------------------ | ------------------------------------- | ------------------------------ |
| **Runtime user**   | `ContainerUser` (built-in, non-admin) | `appuser` (UID 1001, non-root) |
| **Data directory** | `C:\data`                             | `/data`                        |

Mount the data directory to a host path to persist state (profiles, kernels) across container recreations.

!!!tip Persisting data
If you don't mount the volume, every new container starts empty. Kameleo has to download all kernels again, which is slower and uses more bandwidth. Kernel downloads are rate limited, so starting many containers without a mounted volume can hit the limit and make startup fail.
!!!

## Configuration methods

You can configure Kameleo inside the container using the same precedence described in [Configure](../01-getting-started/03-configure.md). In container workflows you typically rely on environment variables or command-line flags appended to `docker run`.

Accepted environment variable names mirror the CLI keys with uppercase; see the full list and defaults in [Configuration options](../05-reference/04-configuration-options.md).

Mandatory credentials must always be provided; without them the app will not authenticate and container startup will fail.

## Steps

### 1. Create a host directory for data

+++ Windows-based container

```powershell
New-Item -ItemType Directory -Path "C:\kameleo-data" -Force | Out-Null
```

+++ Linux-based container

```bash
mkdir -p ~/kameleo-data
```

+++

### 2. Run the container

Expose port 5050, pass credentials, and mount persistent data:

+++ Windows-based container

```powershell
docker pull kameleo/kameleo-app:latest
docker run -p 5050:5050 -e EMAIL="email" -e PASSWORD="pw" -v "C:\kameleo-data:C:\data" kameleo/kameleo-app:latest
```

+++ Linux-based container

```bash
docker pull kameleo/kameleo-app:latest
docker run -p 5050:5050 --shm-size=2g -e EMAIL="email" -e PASSWORD="pw" -v ~/kameleo-data:/data kameleo/kameleo-app:latest
```

+++

### 3. Verify the service

Open in a browser on the host and expect the Swagger UI to load:

```text
http://localhost:5050/swagger
```

## Example with docker-compose

Use `docker-compose.yml` for repeatable infrastructure or CI pipelines:

+++ Windows-based container

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

+++ Linux-based container

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
            - ~/kameleo-data:/data
        shm_size: "2g"
        restart: unless-stopped
```

+++

## Health checks

The published image already defines a `HEALTHCHECK` that periodically queries the `/general/healthcheck` endpoint and marks the container as `healthy` once Kameleo is responsive. Nothing extra is required; the health status is visible via the `State` column:

```bash
docker ps
```

If you build a custom derivative image (e.g., adding tools) and replace the base `CMD`, ensure you keep or re-add a healthcheck so orchestrators wait for readiness.

## AWS ECS Support

Kameleo Docker containers are compatible with **AWS ECS (Elastic Container Service)**. The supported capacity provider depends on the platform:

| Platform | Capacity provider | Notes                                                    |
| -------- | ----------------- | -------------------------------------------------------- |
| Windows  | EC2               | Fargate does not support Windows containers with volumes |
| Linux    | EC2 or Fargate    | Fargate fully supports Linux containers                  |

When deploying to AWS ECS:

- For Windows, use EC2 capacity providers with Windows Server 2022-compatible instances.
- For Linux, EC2 and Fargate both work; Fargate is recommended for simpler infrastructure management.
- Configure appropriate instance types with sufficient resources for your Kameleo workload.
- Mount persistent storage using bind mounts to preserve profile data across container restarts.

## Troubleshooting

### Container exits immediately

This usually means credentials were not provided or are incorrect. Check the container logs:

```bash
docker logs <container-name>
```

Look for authentication errors in the output. Make sure `EMAIL` and `PASSWORD` are passed either as environment variables or as command-line arguments.

### Service is not responding

Manually query the health endpoint to confirm whether the CLI started successfully:

```bash
curl http://localhost:5050/general/healthcheck
```

If the request times out, the container may still be starting up. Kernel downloads run on first launch and can take several minutes depending on your connection.

### Browser crashes on Linux

If browsers fail to open or crash immediately, the container is likely missing the `--shm-size=2g` flag. The default shared memory size of 64 MB is insufficient for browsers. Restart the container with `--shm-size=2g`.

### Kernel download fails or hits rate limit

Kernel downloads are rate limited. If you start many containers simultaneously without a mounted volume, each container downloads its own copy of all kernels and can exhaust the allowed download rate. Always mount the data directory so kernels are downloaded once and reused.
