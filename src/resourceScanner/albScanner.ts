import { ElasticLoadBalancingV2Client, DescribeLoadBalancersCommand, DescribeListenersCommand, DescribeTargetGroupsCommand, LoadBalancer, Listener, TargetGroup, AvailabilityZone } from "@aws-sdk/client-elastic-load-balancing-v2";

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
  return (res.LoadBalancers || []).map((alb: LoadBalancer) => ({
    loadBalancerArn: alb.LoadBalancerArn || '',
    name: alb.LoadBalancerName || '',
    type: alb.Type || '',
    scheme: alb.Scheme || '',
    dnsName: alb.DNSName || '',
    vpcId: alb.VpcId || '',
    subnets: (alb.AvailabilityZones as AvailabilityZone[] | undefined)?.map((z: AvailabilityZone) => z.SubnetId || '').filter(Boolean) || [],
    securityGroups: alb.SecurityGroups || [],
    tags: undefined, // For MVP, skip tags (can be added with DescribeTags)
  }));
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
  return (res.TargetGroups || []).map((tg: TargetGroup) => ({
    targetGroupArn: tg.TargetGroupArn || '',
    name: tg.TargetGroupName || '',
    protocol: tg.Protocol || '',
    port: tg.Port || 80,
    vpcId: tg.VpcId || '',
    targetType: tg.TargetType,
    healthCheckPath: tg.HealthCheckPath,
    tags: undefined, // For MVP, skip tags (can be added with DescribeTags)
  }));
} 