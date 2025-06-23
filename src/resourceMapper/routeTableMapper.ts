import { ScannedRouteTable } from '../resourceScanner';

export interface TerraformRouteTableResource {
  resourceName: string;
  vpcId: string;
  routes: any[];
  associations: any[];
  tags?: { [key: string]: string };
}

export function mapRouteTablesToTerraform(routeTables: ScannedRouteTable[]): TerraformRouteTableResource[] {
  return routeTables.map((rt, idx) => ({
    resourceName: rt.tags?.Name || `route_table_${idx + 1}`,
    vpcId: rt.vpcId,
    routes: rt.routes,
    associations: rt.associations,
    tags: rt.tags,
  }));
} 