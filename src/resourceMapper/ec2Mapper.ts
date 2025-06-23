import { ScannedEC2Instance } from '../resourceScanner';

export interface TerraformEC2Resource {
  resourceName: string;
  ami: string;
  instanceType: string;
  tags?: { [key: string]: string };
  vpcId?: string;
  securityGroups?: string[];
  subnetId?: string;
}

export function mapEC2ToTerraform(instances: ScannedEC2Instance[]): TerraformEC2Resource[] {
  return instances.map((inst, idx) => ({
    resourceName: inst.tags?.Name || `ec2_instance_${idx + 1}`,
    ami: inst.imageId,
    instanceType: inst.instanceType,
    tags: inst.tags,
    vpcId: inst.vpcId,
    securityGroups: inst.securityGroups,
    subnetId: inst.subnetId,
  }));
} 