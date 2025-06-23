import { getAwsClients } from "../awsConnector";
import { DescribeSubnetsCommand, Subnet } from "@aws-sdk/client-ec2";

export interface ScannedSubnet {
  subnetId: string;
  vpcId: string;
  cidrBlock: string;
  availabilityZone: string;
  tags?: { [key: string]: string };
}

export async function scanSubnets(region?: string): Promise<ScannedSubnet[]> {
  const { ec2 } = getAwsClients(region);
  const command = new DescribeSubnetsCommand({});
  const result = await ec2.send(command);
  return (result.Subnets || []).map((subnet: Subnet) => ({
    subnetId: subnet.SubnetId || '',
    vpcId: subnet.VpcId || '',
    cidrBlock: subnet.CidrBlock || '',
    availabilityZone: subnet.AvailabilityZone || '',
    tags: subnet.Tags?.reduce((acc, tag) => {
      if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
      return acc;
    }, {} as { [key: string]: string }),
  }));
} 