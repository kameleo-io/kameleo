// ReSharper disable once CheckNamespace
namespace Kameleo.LocalApiClient.Model
{
    public partial class CookieRequest
    {
        public CookieRequest(BrowserCookie cookie)
            : this(
                cookie.Domain,
                cookie.Name,
                cookie.Path,
                cookie.Value,
                cookie.HostOnly,
                cookie.HttpOnly,
                cookie.Secure,
                cookie.SameSite,
                cookie.ExpirationDate
            )
        { }
    }
}
