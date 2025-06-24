import { ScannedS3Bucket } from '../resourceScanner';

export interface TerraformS3Resource {
  resourceName: string;
  bucket: string;
  acl?: string;
  tags?: { [key: string]: string };
}

export function mapS3ToTerraform(buckets: ScannedS3Bucket[]): TerraformS3Resource[] {
  return buckets.map((bucket, idx) => ({
    resourceName: bucket.name.replace(/[^a-zA-Z0-9_]/g, '_') || `s3_bucket_${idx + 1}`,
    bucket: bucket.name,
    acl: "private",
    tags: bucket.tags,
  }));
} 