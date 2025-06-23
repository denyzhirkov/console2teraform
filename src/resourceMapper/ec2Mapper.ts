import { ScannedEC2Instance } from '../resourceScanner';

export interface TerraformEC2Resource {
  resourceName: string;
  ami?: string;
  instanceType?: string;
  subnetId?: string;
  vpcId?: string;
  securityGroups?: string[];
  tags?: { [key: string]: string };
}

export function mapEC2ToTerraform(instances: ScannedEC2Instance[]): TerraformEC2Resource[] {
  return instances.map((inst, idx) => ({
    resourceName: inst.tags?.Name || `ec2_instance_${idx + 1}`,
    ami: inst.imageId || '',
    instanceType: inst.instanceType || '',
    subnetId: inst.subnetId || '',
    vpcId: inst.vpcId || '',
    securityGroups: inst.securityGroups || [],
    tags: inst.tags || {},
  }));
} 