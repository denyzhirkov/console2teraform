import { ScannedInternetGateway } from '../resourceScanner';
import { sanitizeResourceName, sanitizeTagKey } from './utils';

export interface TerraformIGWResource {
  resourceName: string;
  vpcId?: string;
  tags?: { [key: string]: string };
  tagsHcl?: string;
}

export function mapIGWsToTerraform(igws: ScannedInternetGateway[]): TerraformIGWResource[] {
  return igws.map((igw, idx) => {
    const tags = igw.tags || {};
    return {
      resourceName: sanitizeResourceName(tags?.Name || `igw_${idx + 1}`),
      vpcId: igw.vpcId,
      tags,
      tagsHcl: Object.entries(tags).map(([k, v]) => `${sanitizeTagKey(k)} = "${v}"`).join('\n    '),
    };
  });
} 