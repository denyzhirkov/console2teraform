import { getAwsClients } from "../awsConnector";
import { DescribeSecurityGroupsCommand, SecurityGroup, IpPermission } from "@aws-sdk/client-ec2";

export interface ScannedSecurityGroup {
  groupId: string;
  groupName: string;
  description: string;
  vpcId?: string;
  ingress: IpPermission[];
  egress: IpPermission[];
  tags?: { [key: string]: string };
}

export async function scanSecurityGroups(region?: string): Promise<ScannedSecurityGroup[]> {
  const { ec2 } = getAwsClients(region);
  const command = new DescribeSecurityGroupsCommand({});
  const result = await ec2.send(command);
  return (result.SecurityGroups || []).map((sg: SecurityGroup) => ({
    groupId: sg.GroupId || '',
    groupName: sg.GroupName || '',
    description: sg.Description || '',
    vpcId: sg.VpcId,
    ingress: sg.IpPermissions || [],
    egress: sg.IpPermissionsEgress || [],
    tags: sg.Tags?.reduce((acc, tag) => {
      if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
      return acc;
    }, {} as { [key: string]: string }),
  }));
} 