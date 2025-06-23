import { ScannedRouteTable } from '../resourceScanner';

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
      resourceName: tags?.Name || `route_table_${idx + 1}`,
      vpcId: rt.vpcId,
      routes: rt.routes,
      associations: rt.associations,
      tags,
      tagsHcl: Object.entries(tags).map(([k, v]) => `${k} = "${v}"`).join('\n    '),
    };
  });
} 