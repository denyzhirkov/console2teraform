import { ScannedALB, ScannedALBListener, ScannedALBTargetGroup } from '../resourceScanner';

export interface TerraformALBResource {
  resourceName: string;
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

export interface TerraformALBListenerResource {
  resourceName: string;
  listenerArn: string;
  loadBalancerArn: string;
  port: number;
  protocol: string;
  defaultActions: any[];
}

export interface TerraformALBTargetGroupResource {
  resourceName: string;
  targetGroupArn: string;
  name: string;
  protocol: string;
  port: number;
  vpcId: string;
  targetType?: string;
  healthCheckPath?: string;
  tags?: { [key: string]: string };
}

export function mapALBsToTerraform(albs: ScannedALB[]): TerraformALBResource[] {
  return albs.map((alb, idx) => ({
    resourceName: alb.name.replace(/[^a-zA-Z0-9_]/g, '_') || `alb_${idx + 1}`,
    loadBalancerArn: alb.loadBalancerArn,
    name: alb.name,
    type: alb.type,
    scheme: alb.scheme,
    dnsName: alb.dnsName,
    vpcId: alb.vpcId,
    subnets: alb.subnets,
    securityGroups: alb.securityGroups,
    tags: alb.tags,
  }));
}

export function mapALBListenersToTerraform(listeners: ScannedALBListener[]): TerraformALBListenerResource[] {
  return listeners.map((listener, idx) => ({
    resourceName: `alb_listener_${idx + 1}`,
    listenerArn: listener.listenerArn,
    loadBalancerArn: listener.loadBalancerArn,
    port: listener.port,
    protocol: listener.protocol,
    defaultActions: listener.defaultActions,
  }));
}

export function mapALBTargetGroupsToTerraform(tgs: ScannedALBTargetGroup[]): TerraformALBTargetGroupResource[] {
  return tgs.map((tg, idx) => ({
    resourceName: tg.name.replace(/[^a-zA-Z0-9_]/g, '_') || `alb_tg_${idx + 1}`,
    targetGroupArn: tg.targetGroupArn,
    name: tg.name,
    protocol: tg.protocol,
    port: tg.port,
    vpcId: tg.vpcId,
    targetType: tg.targetType,
    healthCheckPath: tg.healthCheckPath,
    tags: tg.tags,
  }));
} 