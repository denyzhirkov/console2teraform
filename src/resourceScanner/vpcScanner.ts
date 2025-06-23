import { getAwsClients } from "../awsConnector";
import { DescribeVpcsCommand, Vpc } from "@aws-sdk/client-ec2";

export interface ScannedVPC {
  vpcId: string;
  cidrBlock: string;
  tags?: { [key: string]: string };
}

export async function scanVPCs(region?: string): Promise<ScannedVPC[]> {
  const { ec2 } = getAwsClients(region);
  const command = new DescribeVpcsCommand({});
  const result = await ec2.send(command);
  return (result.Vpcs || []).map((vpc: Vpc) => ({
    vpcId: vpc.VpcId || '',
    cidrBlock: vpc.CidrBlock || '',
    tags: vpc.Tags?.reduce((acc, tag) => {
      if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
      return acc;
    }, {} as { [key: string]: string }),
  }));
} 