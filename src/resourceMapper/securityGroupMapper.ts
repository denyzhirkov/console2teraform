import { ScannedSecurityGroup } from '../resourceScanner';
import { sanitizeResourceName, sanitizeTagKey } from './utils';

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
    resourceName: sanitizeResourceName(sg.groupName || `security_group_${idx + 1}`),
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
    tagsHcl: sg.tags ? Object.entries(sg.tags).map(([k, v]) => `${sanitizeTagKey(k)} = "${v}"`).join('\n    ') : undefined,
  }));
} 