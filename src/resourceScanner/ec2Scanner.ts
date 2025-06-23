import { getAwsClients } from "../awsConnector";
import { DescribeInstancesCommand, Instance } from "@aws-sdk/client-ec2";

export interface ScannedEC2Instance {
  instanceId: string;
  imageId: string;
  instanceType: string;
  tags?: { [key: string]: string };
  vpcId?: string;
  securityGroups?: string[];
  subnetId?: string;
}

export async function scanEC2(region?: string): Promise<ScannedEC2Instance[]> {
  const { ec2 } = getAwsClients(region);
  const command = new DescribeInstancesCommand({});
  const result = await ec2.send(command);
  const instances: ScannedEC2Instance[] = [];
  (result.Reservations || []).forEach(reservation => {
    (reservation.Instances || []).forEach((instance: Instance) => {
      instances.push({
        instanceId: instance.InstanceId || '',
        imageId: instance.ImageId || '',
        instanceType: instance.InstanceType || '',
        tags: instance.Tags?.reduce((acc, tag) => {
          if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
          return acc;
        }, {} as { [key: string]: string }),
        vpcId: instance.VpcId,
        securityGroups: instance.SecurityGroups?.map(sg => sg.GroupId || '').filter(Boolean),
        subnetId: instance.SubnetId,
      });
    });
  });
  return instances;
} 