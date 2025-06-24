import { getAwsClients } from "../awsConnector";
import { ListBucketsCommand, Bucket, GetBucketTaggingCommand } from "@aws-sdk/client-s3";

export interface ScannedS3Bucket {
  name: string;
  creationDate?: Date;
  tags?: { [key: string]: string };
}

export async function scanS3(region?: string): Promise<ScannedS3Bucket[]> {
  const { s3 } = getAwsClients(region);
  const command = new ListBucketsCommand({});
  const result = await s3.send(command);
  const buckets = result.Buckets || [];
  const scannedBuckets: ScannedS3Bucket[] = [];
  for (const bucket of buckets) {
    const name = bucket.Name || '';
    let tags: { [key: string]: string } = {};
    try {
      const tagResult = await s3.send(new GetBucketTaggingCommand({ Bucket: name }));
      if (tagResult.TagSet) {
        tags = tagResult.TagSet.reduce((acc, tag) => {
          if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
          return acc;
        }, {} as { [key: string]: string });
      }
    } catch (err: any) {
      // If there are no tags or no permissions, just leave tags empty
      if (err.name !== 'NoSuchTagSet' && err.name !== 'AccessDenied') {
        console.warn(`Could not fetch tags for bucket ${name}:`, err.message);
      }
    }
    scannedBuckets.push({
      name,
      creationDate: bucket.CreationDate,
      tags: Object.keys(tags).length > 0 ? tags : undefined,
    });
  }
  return scannedBuckets;
} 