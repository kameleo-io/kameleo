import { KameleoLocalApiClient } from "@kameleo/local-api-client";

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoEngineUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({ basePath: kameleoEngineUri });
await client.verifyEngineReady();

// Create a few profiles to search in
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const createdProfiles = [];
for (let i = 1; i <= 5; i++) {
    createdProfiles.push(
        await client.profile.createProfile({
            fingerprintId: fingerprints[0].id,
            name: `search example ${i}`,
            tags: i % 2 === 0 ? ["search-example", "even"] : ["search-example"],
        }),
    );
}

// searchProfiles returns one page of profiles, filtered and sorted by the Engine, instead of loading all of them like listProfiles
// Note: the endpoint is experimental, its request may change in a future version
// The column ids are the property paths of the returned profiles, e.g. name, tags, browser.product, status.lifetimeState

// The global filter searches every column, e.g. the name, tags, OS, browser and device of the profiles
const byText = await client.profile.searchProfiles({ globalFilter: "search example" });
console.log(`Profiles matching 'search example': ${byText.totalCount}`);

// A column filter with a single text matches by substring, with an array it matches any of the values exactly
// Several column filters must all match
const evenChromeProfiles = await client.profile.searchProfiles({
    columnFilters: [
        { id: "tags", value: "even" },
        { id: "browser.product", value: ["chrome"] },
    ],
});
console.log(`Chrome profiles tagged 'even': ${evenChromeProfiles.items.map((p) => p.name).join(", ")}`);

// The running profiles, without listing the others
const runningProfiles = await client.profile.searchProfiles({
    columnFilters: [{ id: "status.lifetimeState", value: ["starting", "running"] }],
    pagination: { pageIndex: 0, pageSize: 1 },
});
console.log(`Running profiles: ${runningProfiles.totalCount}`);

// Walk the matching profiles page by page, newest first
let pageIndex = 0;
let page;
do {
    page = await client.profile.searchProfiles({
        columnFilters: [{ id: "tags", value: "search-example" }],
        sorting: [{ id: "createdAt", desc: true }],
        pagination: { pageIndex, pageSize: 2 },
    });
    console.log(`Page ${page.pageIndex + 1} of ${page.pageCount}: ${page.items.map((p) => p.name).join(", ")}`);
    pageIndex++;
} while (pageIndex < page.pageCount);

// Delete the profiles of the example
for (const profile of createdProfiles) {
    await client.profile.deleteProfile(profile.id);
}
