using System;
using Kameleo.LocalApiClient;

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));

// List all existing profiles
var profiles = await client.Profile.ListProfilesAsync();

// Delete profiles one by one
foreach (var profile in profiles)
{
    await client.Profile.DeleteProfileAsync(profile.Id);
}

Console.WriteLine($"{profiles.Count} profiles deleted.");
