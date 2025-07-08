import { ScannedS3Bucket } from '../resourceScanner';
import { sanitizeResourceName, sanitizeTagKey } from './utils';

export interface TerraformS3Resource {
  resourceName: string;
  bucket: string;
  acl?: string;
  tags?: { [key: string]: string };
}

export function mapS3ToTerraform(buckets: ScannedS3Bucket[]): TerraformS3Resource[] {
  return buckets.map((bucket, idx) => ({
    resourceName: sanitizeResourceName(bucket.name || `s3_bucket_${idx + 1}`),
    bucket: bucket.name,
    acl: "private",
    tags: bucket.tags,
    tagsHcl: bucket.tags ? Object.entries(bucket.tags).map(([k, v]) => `${sanitizeTagKey(k)} = "${v}"`).join('\n    ') : undefined,
  }));
} 