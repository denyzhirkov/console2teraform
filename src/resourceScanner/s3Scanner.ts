import { getAwsClients } from "../awsConnector";
import { ListBucketsCommand, Bucket } from "@aws-sdk/client-s3";

export interface ScannedS3Bucket {
  name: string;
  creationDate?: Date;
}

export async function scanS3(region?: string): Promise<ScannedS3Bucket[]> {
  const { s3 } = getAwsClients(region);
  const command = new ListBucketsCommand({});
  const result = await s3.send(command);
  return (result.Buckets || []).map((bucket: Bucket) => ({
    name: bucket.Name || '',
    creationDate: bucket.CreationDate,
  }));
} 