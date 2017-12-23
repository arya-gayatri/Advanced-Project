# CSE523 Baycrest
on server for test:<br />
> curl http://127.0.0.1:3001/api/auth/user/authurl

{"status":1,"authurl":"https://accounts.google.com/o/oauth2/auth..."}

## API
- GET /api/auth/user/authurl
- POST /api/auth/token/service/:serviceType
- GET /api/auth/token/service/:serviceType/user/:userName
- GET /api/auth/service/user/:userName
- POST /api/auth/logout/service/:serviceType/user/:userName

## LOG

- update: [11-03-2017]<br />
Using OAuth 2.0 to Access Google APIs
reference: https://developers.google.com/identity/protocols/OAuth2<br />
nodejs: https://github.com/google/google-api-nodejs-client/<br />
http://google.github.io/google-api-nodejs-client/22.2.0/index.html#oauth2-client


- update: [11-09-2017]<br />
Google Drive API
https://developers.google.com/apis-explorer/?hl=en_US#p/drive/v3/drive.files.get?fileId=1eJwLM_hThRrujaftqNRG8wMqwAcdNYigvQ&fields=createdTime%252CimageMediaMetadata%252Cowners&_h=4&
