### build image

```sh
npm -g install yarn
yarn
docker build --rm -t luissaybe/jivecake .
```

### watch for web changes

```sh
npm run watch-web
```

### watch for server changes

```sh
npm run watch-server
```

### clean and run project

```sh
docker-compose down
docker-compose rm
docker-compose up
```

### restart without cleaning database

```sh
docker-compose restart
```

### generate public private keys for jwt signing

```sh
cd server/extra/jwt
ssh-keygen -N '' -t rsa -b 4096 -f jwt.key
```


### note on docker mongo

The default database in development is not mounted to your file system so you may want to occasionally

```sh
docker volume prune
docker system prune
```
