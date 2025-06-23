import { ScannedVPC } from '../resourceScanner';

export interface TerraformVPCResource {
  resourceName: string;
  cidrBlock: string;
  tags?: { [key: string]: string };
}

export function mapVPCsToTerraform(vpcs: ScannedVPC[]): TerraformVPCResource[] {
  return vpcs.map((vpc, idx) => ({
    resourceName: vpc.tags?.Name || `vpc_${idx + 1}`,
    cidrBlock: vpc.cidrBlock,
    tags: vpc.tags,
  }));
} 