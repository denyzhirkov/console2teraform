import { ScannedInternetGateway } from '../resourceScanner';

export interface TerraformIGWResource {
  resourceName: string;
  vpcId?: string;
  tags?: { [key: string]: string };
}

export function mapIGWsToTerraform(igws: ScannedInternetGateway[]): TerraformIGWResource[] {
  return igws.map((igw, idx) => ({
    resourceName: igw.tags?.Name || `igw_${idx + 1}`,
    vpcId: igw.vpcId,
    tags: igw.tags,
  }));
} 