import { getAwsClients } from "../awsConnector";
import { DescribeRouteTablesCommand, RouteTable } from "@aws-sdk/client-ec2";

export interface ScannedRouteTable {
  routeTableId: string;
  vpcId: string;
  routes: any[];
  associations: any[];
  tags?: { [key: string]: string };
}

export async function scanRouteTables(region?: string): Promise<ScannedRouteTable[]> {
  const { ec2 } = getAwsClients(region);
  const command = new DescribeRouteTablesCommand({});
  const result = await ec2.send(command);
  return (result.RouteTables || []).map((rt: RouteTable) => ({
    routeTableId: rt.RouteTableId || '',
    vpcId: rt.VpcId || '',
    routes: rt.Routes || [],
    associations: rt.Associations || [],
    tags: rt.Tags?.reduce((acc, tag) => {
      if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
      return acc;
    }, {} as { [key: string]: string }),
  }));
} 