const getFile = async ({ request, fallbackUrl }) => {
    const url = new URL(request.url);
    const cache = await caches.open('info');
    if (url.pathname == "/reset") {

        return fetch('/reset.html')
    } else if (url.pathname == "/form.html" || url.pathname == "/form") {
        return fetch('/form.html')
    }else if (url.pathname.startsWith('modify.html?')) {
        return fetch(url.pathname)
    } else {
        try { 
            console.log(url.searchParams,url);
            const query = url.searchParams
            const { user, repo, token } = await (await cache.match('/credentials')).json()
            if (url.searchParams.size>0 && (url.searchParams.get('repo')!=repo || url.searchParams.get('user')!=user || url.searchParams.get('token')!=token)) {
                return fetch(`modify.html?user=${(query.get('user') && url.searchParams.get('user')!=user )?query.get('user'):user}&repo=${(query.get('repo') && url.searchParams.get('repo')!=repo )?query.get('repo'):repo}&token=${(query.get('token') && url.searchParams.get('token')!=token )?query.get('token'):token}}`)
            }
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