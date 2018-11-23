### build image

```sh
npm -g install yarn
yarn
cd docker
docker build --rm -t jivecake .
```

### watch for web changes

```sh
npm run watch-web
```

### watch for server changes

```sh
npm run watch-server
```

### run project

```sh
docker-compose down
docker-compose up
```

### generate public private keys for jwt signing

```sh
cd extra/jwt
ssh-keygen -N '' -t rsa -b 4096 -f jwt.key
```
