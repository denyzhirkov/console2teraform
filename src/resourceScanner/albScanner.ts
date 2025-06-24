import { ElasticLoadBalancingV2Client, DescribeLoadBalancersCommand, DescribeListenersCommand, DescribeTargetGroupsCommand, LoadBalancer, Listener, TargetGroup, AvailabilityZone, DescribeTagsCommand } from "@aws-sdk/client-elastic-load-balancing-v2";

export interface ScannedALB {
  loadBalancerArn: string;
  name: string;
  type: string;
  scheme: string;
  dnsName: string;
  vpcId: string;
  subnets: string[];
  securityGroups: string[];
  tags?: { [key: string]: string };
}

export interface ScannedALBListener {
  listenerArn: string;
  loadBalancerArn: string;
  port: number;
  protocol: string;
  defaultActions: any[];
}

export interface ScannedALBTargetGroup {
  targetGroupArn: string;
  name: string;
  protocol: string;
  port: number;
  vpcId: string;
  targetType?: string;
  healthCheckPath?: string;
  tags?: { [key: string]: string };
}

export async function scanALBs(region?: string): Promise<ScannedALB[]> {
  const elbv2 = new ElasticLoadBalancingV2Client({ region });
  const cmd = new DescribeLoadBalancersCommand({});
  const res = await elbv2.send(cmd);
  const albs: ScannedALB[] = [];
  for (const alb of res.LoadBalancers || []) {
    let tags: { [key: string]: string } = {};
    try {
      const tagRes = await elbv2.send(new DescribeTagsCommand({ ResourceArns: [alb.LoadBalancerArn!] }));
      const tagDesc = tagRes.TagDescriptions?.[0];
      if (tagDesc && tagDesc.Tags) {
        tags = tagDesc.Tags.reduce((acc, tag) => {
          if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
          return acc;
        }, {} as { [key: string]: string });
      }
    } catch (err: any) {
      // If there are no tags or no permissions, just leave tags empty
      if (err.name !== 'AccessDenied') {
        console.warn(`Could not fetch tags for ALB ${alb.LoadBalancerArn}:`, err.message);
      }
    }
    albs.push({
      loadBalancerArn: alb.LoadBalancerArn || '',
      name: alb.LoadBalancerName || '',
      type: alb.Type || '',
      scheme: alb.Scheme || '',
      dnsName: alb.DNSName || '',
      vpcId: alb.VpcId || '',
      subnets: (alb.AvailabilityZones as AvailabilityZone[] | undefined)?.map((z: AvailabilityZone) => z.SubnetId || '').filter(Boolean) || [],
      securityGroups: alb.SecurityGroups || [],
      tags: Object.keys(tags).length > 0 ? tags : undefined,
    });
  }
  return albs;
}

export async function scanALBListeners(loadBalancerArn: string, region?: string): Promise<ScannedALBListener[]> {
  const elbv2 = new ElasticLoadBalancingV2Client({ region });
  const cmd = new DescribeListenersCommand({ LoadBalancerArn: loadBalancerArn });
  const res = await elbv2.send(cmd);
  return (res.Listeners || []).map((listener: Listener) => ({
    listenerArn: listener.ListenerArn || '',
    loadBalancerArn: listener.LoadBalancerArn || '',
    port: listener.Port || 80,
    protocol: listener.Protocol || '',
    defaultActions: listener.DefaultActions || [],
  }));
}

export async function scanALBTargetGroups(loadBalancerArn: string, region?: string): Promise<ScannedALBTargetGroup[]> {
  const elbv2 = new ElasticLoadBalancingV2Client({ region });
  const cmd = new DescribeTargetGroupsCommand({ LoadBalancerArn: loadBalancerArn });
  const res = await elbv2.send(cmd);
  const tgs: ScannedALBTargetGroup[] = [];
  for (const tg of res.TargetGroups || []) {
    let tags: { [key: string]: string } = {};
    try {
      const tagRes = await elbv2.send(new DescribeTagsCommand({ ResourceArns: [tg.TargetGroupArn!] }));
      const tagDesc = tagRes.TagDescriptions?.[0];
      if (tagDesc && tagDesc.Tags) {
        tags = tagDesc.Tags.reduce((acc, tag) => {
          if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
          return acc;
        }, {} as { [key: string]: string });
      }
    } catch (err: any) {
      if (err.name !== 'AccessDenied') {
        console.warn(`Could not fetch tags for TargetGroup ${tg.TargetGroupArn}:`, err.message);
      }
    }
    tgs.push({
      targetGroupArn: tg.TargetGroupArn || '',
      name: tg.TargetGroupName || '',
      protocol: tg.Protocol || '',
      port: tg.Port || 80,
      vpcId: tg.VpcId || '',
      targetType: tg.TargetType,
      healthCheckPath: tg.HealthCheckPath,
      tags: Object.keys(tags).length > 0 ? tags : undefined,
    });
  }
  return tgs;
} 