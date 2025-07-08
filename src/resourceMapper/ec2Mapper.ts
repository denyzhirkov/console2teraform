import { ScannedEC2Instance } from '../resourceScanner';
import { sanitizeResourceName, sanitizeTagKey } from './utils';

export interface TerraformEC2Resource {
  resourceName: string;
  ami?: string;
  instanceType?: string;
  subnetId?: string;
  vpcId?: string;
  securityGroups?: string[];
  tags?: { [key: string]: string };
  securityGroupsHcl?: string;
  tagsHcl?: string;
}

export function mapEC2ToTerraform(instances: ScannedEC2Instance[]): TerraformEC2Resource[] {
  return instances.map((inst, idx) => {
    const securityGroups = inst.securityGroups || [];
    const tags = inst.tags || {};
    return {
      resourceName: sanitizeResourceName(tags?.Name || `ec2_instance_${idx + 1}`),
      ami: inst.imageId || '',
      instanceType: inst.instanceType || '',
      subnetId: inst.subnetId || '',
      vpcId: inst.vpcId || '',
      securityGroups,
      tags,
      securityGroupsHcl: securityGroups.map(sg => `"${sg}"`).join(', '),
      tagsHcl: Object.entries(tags).map(([k, v]) => `${sanitizeTagKey(k)} = "${v}"`).join('\n    '),
    };
  });
} 