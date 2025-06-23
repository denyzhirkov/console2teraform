import { EC2Client } from "@aws-sdk/client-ec2";
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import dotenv from "dotenv";

dotenv.config();

// Create AWS clients
export function getAwsClients(region: string = process.env.AWS_REGION || "us-east-1") {
  const ec2 = new EC2Client({ region });
  const s3 = new S3Client({ region });
  const sts = new STSClient({ region });
  return { ec2, s3, sts };
}

// Check AWS connection (get caller identity)
export async function checkConnection(region?: string): Promise<string> {
  const { sts } = getAwsClients(region);
  try {
    const command = new GetCallerIdentityCommand({});
    const response = await sts.send(command);
    return `Connected as: ${response.Arn}`;
  } catch (error) {
    throw new Error(`AWS connection failed: ${error}`);
  }
}
