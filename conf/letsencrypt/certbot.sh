certbot certonly --manual \
  --preferred-challenges dns \
  --server https://acme-v02.api.letsencrypt.org/directory \
  --agree-tos -m vue2598@gmail.com \
  -d *.malrang.dev