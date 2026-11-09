using System;
using System.Collections.Generic;
using System.Linq;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));
await client.VerifyEngineReadyAsync();

// Create a few profiles to search in
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync("desktop", null, "chrome");
var createdProfiles = new List<ProfileResponse>();
for (var i = 1; i <= 5; i++)
{
    createdProfiles.Add(await client.Profile.CreateProfileAsync(new CreateProfileRequest(fingerprints[0].Id)
    {
        Name = $"search example {i}",
        Tags = i % 2 == 0 ? ["search-example", "even"] : ["search-example"],
    }));
}

// SearchProfiles returns one page of profiles, filtered and sorted by the Engine, instead of loading all of them like ListProfiles
// Note: the endpoint is experimental, its request may change in a future version
// The column ids are the property paths of the returned profiles, e.g. name, tags, browser.product, status.lifetimeState

// The global filter searches every column, e.g. the name, tags, OS, browser and device of the profiles
var byText = await client.Profile.SearchProfilesAsync(new TableRequest(globalFilter: "search example"));
Console.WriteLine($"Profiles matching 'search example': {byText.TotalCount}");

// A column filter with a single text matches by substring, with an array it matches any of the values exactly
// Several column filters must all match
var evenChromeProfiles = await client.Profile.SearchProfilesAsync(new TableRequest(columnFilters:
[
    new ColumnFilterState("tags", "even"),
    new ColumnFilterState("browser.product", new[] { "chrome" }),
]));
Console.WriteLine($"Chrome profiles tagged 'even': {string.Join(", ", evenChromeProfiles.Items.Select(p => p.Name))}");

// The running profiles, without listing the others
var runningProfiles = await client.Profile.SearchProfilesAsync(new TableRequest(
    columnFilters: [new ColumnFilterState("status.lifetimeState", new[] { "starting", "running" })],
    pagination: new PaginationState(pageIndex: 0, pageSize: 1)));
Console.WriteLine($"Running profiles: {runningProfiles.TotalCount}");

// Walk the matching profiles page by page, newest first
var pageIndex = 0;
ProfilePreviewPagedResponse page;
do
{
    page = await client.Profile.SearchProfilesAsync(new TableRequest(
        columnFilters: [new ColumnFilterState("tags", "search-example")],
        sorting: [new SortingState("createdAt", desc: true)],
        pagination: new PaginationState(pageIndex, pageSize: 2)));
    Console.WriteLine($"Page {page.PageIndex + 1} of {page.PageCount}: {string.Join(", ", page.Items.Select(p => p.Name))}");
    pageIndex++;
}
while (pageIndex < page.PageCount);

// Delete the profiles of the example
foreach (var profile in createdProfiles)
{
    await client.Profile.DeleteProfileAsync(profile.Id);
}
