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
