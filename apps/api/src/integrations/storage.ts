import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '../config/env.js';

export const s3Client = new S3Client({
  region: env.s3.region,
  endpoint: env.s3.endpoint,
  forcePathStyle: env.s3.forcePathStyle,
  credentials: {
    accessKeyId: env.s3.accessKey,
    secretAccessKey: env.s3.secretKey,
  },
});

export async function uploadBuffer(params: {
  key: string;
  body: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType ?? 'application/octet-stream',
      Metadata: params.metadata,
    }),
  );
  return `s3://${env.s3.bucket}/${params.key}`;
}

export async function getPresignedGetUrl(key: string, expiresIn = 900): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: env.s3.bucket, Key: key });
  return getSignedUrl(s3Client, cmd, { expiresIn });
}

export async function getPresignedPutUrl(params: {
  key: string;
  contentType?: string;
  expiresIn?: number;
}): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: params.key,
    ContentType: params.contentType,
  });
  return getSignedUrl(s3Client, cmd, { expiresIn: params.expiresIn ?? 900 });
}

/**
 * Strip `s3://bucket/` prefix from a stored url to get back the key.
 */
export function s3UrlToKey(url: string): string {
  const prefix = `s3://${env.s3.bucket}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : url;
}
