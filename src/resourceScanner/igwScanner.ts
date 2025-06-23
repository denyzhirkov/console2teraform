import { getAwsClients } from "../awsConnector";
import { DescribeInternetGatewaysCommand, InternetGateway } from "@aws-sdk/client-ec2";

export interface ScannedInternetGateway {
  igwId: string;
  vpcId?: string;
  tags?: { [key: string]: string };
}

export async function scanInternetGateways(region?: string): Promise<ScannedInternetGateway[]> {
  const { ec2 } = getAwsClients(region);
  const command = new DescribeInternetGatewaysCommand({});
  const result = await ec2.send(command);
  return (result.InternetGateways || []).map((igw: InternetGateway) => ({
    igwId: igw.InternetGatewayId || '',
    vpcId: igw.Attachments && igw.Attachments[0] ? igw.Attachments[0].VpcId : undefined,
    tags: igw.Tags?.reduce((acc, tag) => {
      if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
      return acc;
    }, {} as { [key: string]: string }),
  }));
} 