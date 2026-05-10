
export async function onRequestPost(context){
const { request, env } = context;
const body = await request.json();

const id = "readinglog-" + Math.random().toString(36).substring(2,10);
const path = `logs/${id}.html`;

const content = btoa(unescape(encodeURIComponent(body.html)));

await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,{
method:"PUT",
headers:{
"Authorization":`Bearer ${env.GITHUB_TOKEN}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:`Create ${id}`,
content
})
});

return Response.json({
url:`${env.SITE_URL}/logs/${id}.html`
});
}
