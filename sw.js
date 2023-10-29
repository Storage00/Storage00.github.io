const getFile = async ({ request, fallbackUrl }) => {
    const url = new URL(request.url);
    const cache = await caches.open('info');
    if (url.pathname == "/reset") {
        caches.delete('info');
        return fetch('/reset.html')
    } else if (url.pathname == "/form.html" || url.pathname == "/form") {
        caches.delete('info');
        return fetch('/form.html')
    } else {
        try {
            const { user, repo, token } = await (await cache.match('/credentials')).json()
            const headers = {
                'Accept': 'application/vnd.github.v3.raw',
                'Authorization': `Bearer ${token}`,
                'X-GitHub-Api-Version': '2022-11-28'
            };
            // parse the request as an url 
            const response = await (await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${url.pathname}`, { headers })).blob()
            return new Response(response, {
                status: 200,
                headers: url.pathname.match(/html?/) ? { "Content-Type": "text/html" } : url.pathname.match(/css/) ? { "Content-Type": "text/css" } : {},
            });
        } catch (e) {
            return fetch('/error.html')
        }
    }
};

self.addEventListener("fetch", (event) => {
    event.respondWith(
        getFile({
            request: event.request,
            fallbackUrl: "",
        }),
    );
});