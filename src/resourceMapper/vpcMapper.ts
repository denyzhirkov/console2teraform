import { ScannedVPC } from '../resourceScanner';

export interface TerraformVPCResource {
  resourceName: string;
  cidrBlock: string;
  tags?: { [key: string]: string };
  tagsHcl?: string;
}

export function mapVPCsToTerraform(vpcs: ScannedVPC[]): TerraformVPCResource[] {
  return vpcs.map((vpc, idx) => {
    const tags = vpc.tags || {};
    return {
      resourceName: tags?.Name || `vpc_${idx + 1}`,
      cidrBlock: vpc.cidrBlock,
      tags,
      tagsHcl: Object.entries(tags).map(([k, v]) => `${k} = "${v}"`).join('\n    '),
    };
  });
} 