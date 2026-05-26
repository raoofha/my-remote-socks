const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const mimeTypes = {
  "" : "text/html",
  "html" : "text/html",
  "css" : "text/css",
  "js" : "text/javascript",
  "jpeg" : "image/jpeg",
  "jpg" : "image/jpeg",
  "png" : "image/png",
  "gif" : "image/gif",
  "webp" : "image/webp",
  "svg" : "image/svg+xml",
  "icon" : "image/x-icon",
  "webm" : "video/webm",
  "ogg" : "video/ogg",
  "mp4" : "video/mp4",
  "mp3" : "audio/mpeg",
  "ttf" : "font/ttf",
  "otf" : "font/otf",
  "woff" : "font/woff",
  "woff2" : "font/woff2",
  "pdf" : "application/pdf",
  "json" : "application/json",
};

//const hostname = '127.0.0.1';
const hostname = '0.0.0.0';
const port = 9099;

var target = "";

child_process.execSync("git pull origin main --rebase", {stdio:[0,1,2],shell: '/bin/bash'});

const server = http.createServer((req, res) => {
  var _url = req.url.substring(1);
  var ext = path.parse(url.parse(_url).pathname).ext.substring(1);
  var mimeType =  mimeTypes[ext] || "text/html";
  var t0 = Date.now();
  if(_url)
  {
    console.log(_url,mimeType);
    child_process.execSync(`#!/bin/bash
echo '#!/bin/bash' > /dev/shm/cmd.sh

echo 'rm data.html' >> /dev/shm/cmd.sh
echo '~/single-file-x86_64-linux "${_url}" data.html' >> /dev/shm/cmd.sh
echo 'echo generating pass' >> /dev/shm/cmd.sh
echo 'openssl rand -base64 -out pass 128' >> /dev/shm/cmd.sh
echo 'echo encrypting pass' >> /dev/shm/cmd.sh
echo 'openssl rsautl -encrypt -inkey key.pub -pubin -in pass -out data.p' >> /dev/shm/cmd.sh
echo 'echo encrypting data' >> /dev/shm/cmd.sh
echo 'openssl enc -aes-256-cbc -salt -in data.html -out data -pass file:pass' >> /dev/shm/cmd.sh
echo 'rm pass' >> /dev/shm/cmd.sh
echo 'git config user.name "github-actions"'  >> /dev/shm/cmd.sh
echo 'git config user.email "github-actions@github.com"'  >> /dev/shm/cmd.sh 
echo 'git add data data.p' >> /dev/shm/cmd.sh
echo 'git commit -m "[skip ci]"' >> /dev/shm/cmd.sh
echo 'git push origin main' >> /dev/shm/cmd.sh

echo generating pass
openssl rand -base64 -out /dev/shm/pass 128
echo encrypting pass
openssl rsautl -encrypt -inkey keypair.pub -pubin -in /dev/shm/pass -out cmd.p
echo encrypting cmd
openssl enc -aes-256-cbc -salt -in /dev/shm/cmd.sh -out cmd -pass file:/dev/shm/pass
rm /dev/shm/pass
git add cmd cmd.p
git commit -m "[skip ci]"
git push origin main

THEN=$(base64 data.p)
NOW=$(base64 data.p)
while true
do
  sleep 2
  git pull origin main
  NOW=$(base64 data.p)
  if [[ "$NOW" != "$THEN" ]] ;
  then
    echo decrypting data.p
    openssl rsautl -decrypt -inkey ${process.argv[2]} -in data.p -out /dev/shm/pass
    echo decrypting data
    openssl enc -d -aes-256-cbc -salt -in data -out /dev/shm/data.html -pass file:/dev/shm/pass
    echo '\n<script>let flag = true; navigation.addEventListener("navigate", (e) => { if(flag) { e.preventDefault(); flag = false; window.location.href = "/" + e.destination.url; } }); window.addEventListener('pageshow', function(e) { flag = true; });</script>' >> /dev/shm/data.html
    rm /dev/shm/pass
    break
  fi
done
`, {stdio:[0,1,2],shell: '/bin/bash'});
  }
  var t1 = Date.now();
  console.log(t1-t0);

  res.statusCode = 200;
  res.setHeader('Content-Type', mimeType);

  var fileStream = fs.createReadStream("/dev/shm/data.html");
  fileStream.pipe(res, { end: true });
});

server.listen(port, hostname, () => { console.log('Server running at http://' + hostname + ':' + port + '\n'); });
