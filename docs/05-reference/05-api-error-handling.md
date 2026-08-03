---
order: -505
title: API error handling
meta:
    description: Learn how the Kameleo Local API returns errors and how to catch and branch on error codes in Python, JavaScript, or C#.
permalink: /reference/api-error-handling
---

Every non-2xx response from the Local API is an error. All SDKs deserialize the response body into a structured `ProblemResponse` object and surface it through a typed exception so you can react programmatically.

## ProblemResponse structure

The API always returns an [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) `ProblemResponse` body on errors.

| Field       | Type        | Description                                                         |
| ----------- | ----------- | ------------------------------------------------------------------- |
| `status`    | `integer`   | The HTTP status code (e.g., `404`, `422`).                          |
| `errorCode` | `ErrorCode` | A machine-readable error code. Use this for programmatic branching. |
| `type`      | `string`    | A URI identifying the problem type.                                 |
| `title`     | `string`    | A short, human-readable summary of the problem.                     |
| `detail`    | `string`    | A human-readable explanation of this specific occurrence.           |
| `instance`  | `string`    | A URI identifying the specific occurrence.                          |
| `errors`    | `object`    | Validation errors keyed by field name.                              |

!!!tip Note
Always branch on `errorCode`, not on `title` or `detail`. The human-readable fields are intended for logging and debugging, and their exact wording may change between versions.
!!!

## ErrorCode values

The `errorCode` field is a string enum. All possible values are listed below.

| Value                                          | Description                                                                      |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `no_token`                                     | No authentication token was provided.                                            |
| `unauthorized`                                 | The current access level is not authorized for this operation.                   |
| `invalid_session`                              | The session is invalid.                                                          |
| `token_expired`                                | The authentication token has expired.                                            |
| `authentication_failed`                        | Authentication against Kameleo cloud services failed.                            |
| `accountless_limit_reached`                    | The accountless usage limit is reached.                                          |
| `no_capability`                                | The subscription does not include the required capability.                       |
| `no_cookies_capability`                        | The subscription does not include the cookie management capability.              |
| `no_mobile_capability`                         | The subscription does not include mobile profiles.                               |
| `no_proxy_test_capability`                     | The subscription does not include proxy testing.                                 |
| `no_cloud_capability`                          | The subscription does not include cloud profiles.                                |
| `no_local_capability`                          | The subscription does not include local profiles.                                |
| `no_groups_capability`                         | The subscription does not include team groups.                                   |
| `no_headless_capability`                       | The subscription does not include headless browser support.                      |
| `profile_not_found`                            | No profile with the given ID exists.                                             |
| `profile_already_running`                      | The profile is already running; start was called again.                          |
| `profile_not_running`                          | The profile is not running; an operation requiring a running profile was called. |
| `profile_running`                              | The profile is currently running; the operation requires it to be stopped.       |
| `profile_locked`                               | The profile is locked by another process.                                        |
| `profile_syncing`                              | The profile is currently syncing with cloud.                                     |
| `profile_never_started`                        | The profile has never been started; no browser data exists yet.                  |
| `browser_engine_outdated`                      | The local browser kernel is outdated and must be updated.                        |
| `proxy_connection_issue`                       | Failed to connect to the configured proxy.                                       |
| `cloud_limit_reached`                          | The cloud profile storage limit is reached.                                      |
| `cloud_profile_not_exportable`                 | Cloud profiles cannot be exported.                                               |
| `profile_already_imported`                     | The profile has already been imported.                                           |
| `incompatible_file`                            | The file is incompatible with this version of Kameleo.                           |
| `running_profiles_limit_reached`               | Concurrent browser limit is reached.                                             |
| `running_mobile_profiles_limit_reached`        | Mobile concurrent browser limit is reached.                                      |
| `profile_minutes_limit_reached`                | The browser usage quota is exhausted.                                            |
| `downloaded_cloud_profile_bytes_limit_reached` | The cloud profile download quota is exhausted.                                   |
| `folder_not_found`                             | No folder with the given ID exists.                                              |
| `database_not_found`                           | The local database could not be found.                                           |
| `validation_failed`                            | Request body validation failed; see the `errors` field for details.              |
| `invalid_request`                              | The request is malformed or contains invalid parameters.                         |
| `service_not_ready`                            | The Engine is still starting up and cannot handle requests yet.                  |
| `rate_limit_exceeded`                          | Too many requests were sent in a short period.                                   |
| `kernel_download_limit_reached`                | The browser kernel download quota is exhausted.                                  |
| `kernel_not_found`                             | No kernel matching the requested criteria could be found.                        |
| `kernel_in_use`                                | The kernel is in use and cannot be removed.                                      |
| `cdp_connection_failed`                        | The Chrome DevTools Protocol connection to the browser failed.                   |
| `browser_instrumentation_disabled`             | Browser instrumentation is disabled for this profile.                            |
| `vnc_not_supported`                            | VNC is not supported on this platform or configuration.                          |
| `upload_failed`                                | Uploading the file failed.                                                       |
| `unexpected_error`                             | An unexpected internal error occurred.                                           |

!!!tip Note
For how concurrent browser (CB) and mobile CB quotas work and how to check current usage, see [Usage limits](./03-usage-limits.md).
!!!

## Exception types per SDK

### Python — `ApiException`

Raised by every API call that returns a non-2xx status. Import it from `kameleo.local_api_client.exceptions`.

| Property | Type | Description |
| ------------ | ---------------- | ------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| `status` | `int` | HTTP status code. |
| `error_code` | `ErrorCode       | str                 | None` | Deserialized `ErrorCode` enum value, or the raw string if unknown. |
| `problem` | `ProblemResponse | None` | Full deserialized `ProblemResponse`. |
| `reason` | `str` | HTTP reason phrase. |
| `body` | `str             | None` | Raw response body string. |
| `headers` | any | Response headers. |

### JavaScript / TypeScript — `ResponseError`

Thrown by every SDK method on a non-2xx response. Import it from `@kameleo/local-api-client`.

| Property | Type | Description |
| ----------- | ---------------- | ---------------------------------- | ------------------------------------ |
| `response` | `Response` | The raw `fetch` `Response` object. |
| `errorCode` | `ErrorCode       | undefined` | Deserialized `ErrorCode` enum value. |
| `problem` | `ProblemResponse | undefined` | Full deserialized `ProblemResponse`. |
| `message` | `string` | Human-readable error message. |

### C# — `ApiException`

Thrown by every async API method on a non-2xx response. Located in `Kameleo.LocalApiClient.Client`.

| Property     | Type                       | Description                                                            |
| ------------ | -------------------------- | ---------------------------------------------------------------------- |
| `StatusCode` | `int`                      | HTTP status code.                                                      |
| `ErrorCode`  | `ErrorCode?`               | Deserialized `ErrorCode` enum value (shortcut to `Problem.ErrorCode`). |
| `Problem`    | `ProblemResponse`          | Full deserialized `ProblemResponse`.                                   |
| `Message`    | `string`                   | Human-readable error message (inherited from `Exception`).             |
| `Headers`    | `Multimap<string, string>` | Response headers.                                                      |

## Catching and handling errors

The following examples show the recommended pattern: catch the SDK exception, check `errorCode` for known conditions, and let unexpected errors propagate or be handled at a higher level.

+++ Python

```python
from kameleo.local_api_client.exceptions import ApiException
from kameleo.local_api_client.models import ErrorCode

try:
    client.profile.delete_profile(profile_id)
except ApiException as ex:
    if ex.error_code == ErrorCode.PROFILE_NOT_FOUND:
        # Ignore: already deleted
        print(f"Already deleted: {ex}")
    else:
        print(f"Unexpected error: {ex}")
        raise
```

+++ JavaScript

```javascript
import { ErrorCode, ResponseError } from "@kameleo/local-api-client";

try {
    await client.profile.deleteProfile(profileId);
} catch (error) {
    if (error instanceof ResponseError && error.errorCode === ErrorCode.ProfileNotFound) {
        // Ignore: already deleted
        console.error("Already deleted:", error);
    } else {
        console.error("Unexpected error:", error);
        throw error;
    }
}
```

+++ C#

```csharp
using Kameleo.LocalApiClient.Client;
using Kameleo.LocalApiClient.Model;

try
{
    await client.Profile.DeleteProfileAsync(profileId);
}
catch (ApiException ex) when (ex.ErrorCode == ErrorCode.ProfileNotFound)
{
    // Ignore: already deleted
    Console.WriteLine($"Already deleted: {ex}");
}
catch (Exception ex)
{
    Console.WriteLine($"Unexpected error: {ex}");
    throw;
}
```

+++
