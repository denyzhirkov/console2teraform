import { ScannedInternetGateway } from '../resourceScanner';

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
      resourceName: tags?.Name || `igw_${idx + 1}`,
      vpcId: igw.vpcId,
      tags,
      tagsHcl: Object.entries(tags).map(([k, v]) => `${k} = "${v}"`).join('\n    '),
    };
  });
} 