import AWS from 'aws-sdk';
import { settings } from 'settings';

export const upload = (Key, Body, ContentType) => {
  const { bucket, endpoint, region, key, secret } = settings.digitalocean.spaces;
  const spacesEndpoint = new AWS.Endpoint(endpoint);
  const s3 = new AWS.S3({
      region: region,
      endpoint: spacesEndpoint,
      accessKeyId: key,
      secretAccessKey: secret,
  });

  return new Promise((resolve, reject) => {
    s3.putObject({
      ACL: 'public-read',
      Body,
      Bucket: bucket,
      Key,
      ContentType
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const url = `https://${bucket}.${region}.cdn.digitaloceanspaces.com/${Key}`;

        resolve({
          data,
          url
        });
      }
   });
  });
}
