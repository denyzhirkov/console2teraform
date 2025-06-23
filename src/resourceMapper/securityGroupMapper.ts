import { ScannedSecurityGroup } from '../resourceScanner';

export interface TerraformSecurityGroupResource {
  resourceName: string;
  description: string;
  vpcId?: string;
  ingress: any[];
  egress: any[];
  tags?: { [key: string]: string };
}

export function mapSecurityGroupsToTerraform(groups: ScannedSecurityGroup[]): TerraformSecurityGroupResource[] {
  return groups.map((sg, idx) => ({
    resourceName: sg.groupName.replace(/[^a-zA-Z0-9_]/g, '_') || `security_group_${idx + 1}`,
    description: sg.description,
    vpcId: sg.vpcId,
    ingress: (sg.ingress || []).map(rule => ({
      ...rule,
      cidrBlocksHcl: (rule.IpRanges || []).map(r => `"${r.CidrIp}"`).join(', ')
    })),
    egress: (sg.egress || []).map(rule => ({
      ...rule,
      cidrBlocksHcl: (rule.IpRanges || []).map(r => `"${r.CidrIp}"`).join(', ')
    })),
    tags: sg.tags,
  }));
} 