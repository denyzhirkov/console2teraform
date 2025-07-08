import { ScannedRouteTable } from '../resourceScanner';
import { sanitizeResourceName, sanitizeTagKey } from './utils';

export interface TerraformRouteTableResource {
  resourceName: string;
  vpcId: string;
  routes: any[];
  associations: any[];
  tags?: { [key: string]: string };
  tagsHcl?: string;
}

export function mapRouteTablesToTerraform(routeTables: ScannedRouteTable[]): TerraformRouteTableResource[] {
  return routeTables.map((rt, idx) => {
    const tags = rt.tags || {};
    return {
      resourceName: sanitizeResourceName(tags?.Name || `route_table_${idx + 1}`),
      vpcId: rt.vpcId,
      routes: rt.routes,
      associations: rt.associations,
      tags,
      tagsHcl: Object.entries(tags).map(([k, v]) => `${sanitizeTagKey(k)} = "${v}"`).join('\n    '),
    };
  });
} 