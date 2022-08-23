const http = require('http');
const { exec } = require('child_process');
const { exit } = require('process');
const { parse, stringify } = require('querystring');

const { readFileSync } = require('fs');

const loginResultHtml = readFileSync('login-result.html', 'utf8');

const host = 'localhost';
const port = 8000;
const ownDomain = `http://${host}:${port}`;

const loginDomain = 'https://login.salesforce.com';
const authPath = '/services/oauth2/authorize';
const tokenPath = '/services/oauth2/token';
const postUrl = loginDomain + tokenPath; // Used by certain flows. When posting, use Content-Type: application/x-www-form-urlencoded

const consumerKey = process.env.CONSUMER_KEY; // This value can be hard-coded in client apps
const consumerSecret = process.env.CONSUMER_SECRET; // This value must not be hard-coded in untrusted client apps.

// Using User-Agent Flow - no POST necessary
const responseType = 'token';

// const responseType = 'code'; // If using Web-Server Flow
const authSearch = '?' + stringify({
    response_type: responseType,
    client_id: consumerKey,
    redirect_uri: ownDomain
});

// const webServerFlowPost = stringify({
//     grant_type: 'authorization_code',
//     code,
//     client_id: consumerKey,
//     client_secret: consumerSecret,
//     redirect_uri: ownDomain
// });

// const usernamePasswordFlow = stringify({
//     grant_type: 'password',
//     client_id: consumerKey,
//     client_secret: consumerSecret,
//     username,
//     password
// });

// const deviceFlowPost1 = stringify({
//     response_type: 'device_code',
//     client_id: consumerKey,
// }); // Receive code   
// const deviceFlowPost2 = stringify({
//     grant_type: 'device'
//     code,
//     client_id: consumerKey,
// });

// const refreshTokenFlowPost = stringify({
//     grant_type: 'refresh_token',
//     client_id: consumerKey,
//     refresh_token
// });

const loginUrl = new URL(loginDomain);
loginUrl.pathname = authPath;
loginUrl.search = authSearch;

function openBrowser(url) {
    console.log(`Opening ${url}`);
    const cp = exec(`open "${url}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            exit(cp.exitCode);
        }
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.error(error);
            exit(cp.exitCode);
        }
    });
}

const server = http.createServer((req, res) => {
    const url = req.url;

    if (url.indexOf('/hash/') !== -1) {
        const hash = url.slice(url.lastIndexOf('/') + 1);
        console.log('===>', parse(hash));
    }

    res.writeHead(200);
    res.end(loginResultHtml);
});

server.listen(port, host, () => {
    console.log(`Server started on ${ownDomain}`);
});

try {
    openBrowser(loginUrl);
} catch (error) {
    console.error(error);
    exit(1);
};
