import { ScannedSubnet } from '../resourceScanner';
import { sanitizeResourceName, sanitizeTagKey } from './utils';

export interface TerraformSubnetResource {
  resourceName: string;
  vpcId: string;
  cidrBlock: string;
  availabilityZone: string;
  tags?: { [key: string]: string };
  tagsHcl?: string;
}

export function mapSubnetsToTerraform(subnets: ScannedSubnet[]): TerraformSubnetResource[] {
  return subnets.map((subnet, idx) => {
    const tags = subnet.tags || {};
    return {
      resourceName: sanitizeResourceName(tags?.Name || `subnet_${idx + 1}`),
      vpcId: subnet.vpcId,
      cidrBlock: subnet.cidrBlock,
      availabilityZone: subnet.availabilityZone,
      tags,
      tagsHcl: Object.entries(tags).map(([k, v]) => `${sanitizeTagKey(k)} = "${v}"`).join('\n    '),
    };
  });
} 