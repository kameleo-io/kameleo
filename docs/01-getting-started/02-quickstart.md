---
order: -102
title: Quickstart
description: Create, start, automate, and stop a profile via the Local API.
permalink: /getting-started/quickstart
---

Learn how to spin up the local Kameleo CLI, connect via an SDK, search a fingerprint, then create, start, automate, and stop a reusable profile. Core automation examples (Selenium, Puppeteer, Playwright) show how to drive the running profile immediately.

!!!tip Note
API usage is subject to requests-per-minute limits. See the detailed limits table in [API rate limits](../05-reference/03-api-rate-limits.md).
!!!

## 1. Start Kameleo CLI

Ensure the Kameleo CLI is installed and running (see [Installation](./01-installation.md)). When started locally, it serves its API at <http://localhost:5050> by default.

## 2. Install an SDK

Kameleo components and SDKs follow semantic versioning (_major_._minor_._patch_). For the most reliable experience, install SDK versions whose _major_ and _minor_ match your running Kameleo CLI version.

!!!warning Version compatibility
Using a significantly newer SDK with an older CLI (or vice versa) can result in missing operations, model field mismatches, or unexpected errors.
!!!

Select one of the language SDKs below to get started:

+++ Python

```bash
pip install kameleo.local-api-client
```

For more details see our package at [PyPI.org](https://pypi.org/project/kameleo-local-api-client/).

+++ JavaScript

```bash
npm i @kameleo/local-api-client
```

For more details see our package at [npmjs.com](https://www.npmjs.com/package/@kameleo/local-api-client).

+++ C#

```bash
dotnet add package Kameleo.LocalApiClient
```

For more details see our package at [NuGet.org](https://www.nuget.org/packages/Kameleo.LocalApiClient).

+++

## 3. Create a client

Create a client instance pointed at the local endpoint. All SDKs expose the same operations.

+++ Python

```python
from kameleo.local_api_client import KameleoLocalApiClient
client = KameleoLocalApiClient(endpoint='http://localhost:5050')
```

+++ JavaScript

```js
import { KameleoLocalApiClient } from "@kameleo/local-api-client";
const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));
```

+++

## 4. Search a fingerprint

Search for a fingerprint matching the desired device type, operating system, browser, and version. You can filter versions with operators like >, >=, or <. Each result set returns a maximum of 25 fingerprints, ordered by browser version in descending order.

+++ Python

```python
fps = client.fingerprint.search_fingerprints(device_type='desktop', platform='windows', browser_product='chrome', browser_version='>137')
```

+++ JavaScript

```js
const fps = await client.fingerprint.searchFingerprints("desktop", "windows", "chrome", ">137");
```

+++ C#

```csharp
var fps = await client.Fingerprint.SearchFingerprintsAsync("desktop", "windows", "chrome", ">137");
```

+++

## 5. Create profile

Create a profile from that fingerprint with a given name. Proxy, storage settings and other options are optional and skipped here.

+++ Python

```python
from kameleo.local_api_client.models import CreateProfileRequest
profile = client.profile.create_profile(CreateProfileRequest(fingerprint_id=fps[0].id, name='quick demo'))
```

+++ JavaScript

```js
const profile = await client.profile.createProfile({ fingerprintId: fps[0].id, name: "quick demo" });
```

+++ C#

```csharp
using Kameleo.LocalApiClient.Model;
var profile = await client.Profile.CreateProfileAsync(new CreateProfileRequest(fps[0].Id){ Name = "quick demo"});
```

+++

## 6. Start profile

Start the profile. Missing kernel files download automatically and a browser opens for automation.

+++ Python

```python
client.profile.start_profile(profile.id)
```

+++ JavaScript

```js
await client.profile.startProfile(profile.id);
```

+++ C#

```csharp
await client.Profile.StartProfileAsync(profile.Id);
```

+++

## Next steps

Continue by automating the running profile using one of these guides:

- [Selenium integration guide](../03-integrations/01-selenium.md)
- [Playwright integration guide](../03-integrations/02-playwright.md)
- [Puppeteer integration guide](../03-integrations/03-puppeteer.md)
