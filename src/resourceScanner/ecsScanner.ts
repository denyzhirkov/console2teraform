import { ECSClient, ListClustersCommand, DescribeClustersCommand, ListServicesCommand, DescribeServicesCommand, ListTaskDefinitionsCommand, DescribeTaskDefinitionCommand, Tag as ECSTag, Cluster as ECSCluster, Service as ECSService, TaskDefinition as ECSTaskDefinition } from "@aws-sdk/client-ecs";

export interface ScannedECSCluster {
  clusterArn: string;
  clusterName: string;
  status: string;
  tags?: { [key: string]: string };
}

export interface ScannedECSService {
  serviceArn: string;
  serviceName: string;
  clusterArn: string;
  taskDefinition: string;
  desiredCount: number;
  launchType?: string;
  tags?: { [key: string]: string };
}

export interface ScannedECSTaskDefinition {
  taskDefinitionArn: string;
  family: string;
  containerDefinitions: any[];
  requiresCompatibilities?: string[];
  cpu?: string;
  memory?: string;
  networkMode?: string;
  tags?: { [key: string]: string };
}

export async function scanECSClusters(region?: string): Promise<ScannedECSCluster[]> {
  const ecs = new ECSClient({ region });
  const listCmd = new ListClustersCommand({});
  const listRes = await ecs.send(listCmd);
  if (!listRes.clusterArns || listRes.clusterArns.length === 0) return [];
  const descCmd = new DescribeClustersCommand({ clusters: listRes.clusterArns });
  const descRes = await ecs.send(descCmd);
  return (descRes.clusters || []).map((cluster: ECSCluster) => ({
    clusterArn: cluster.clusterArn || '',
    clusterName: cluster.clusterName || '',
    status: cluster.status || '',
    tags: cluster.tags as { [key: string]: string } | undefined,
  }));
}

export async function scanECSServices(clusterArn: string, region?: string): Promise<ScannedECSService[]> {
  const ecs = new ECSClient({ region });
  const listCmd = new ListServicesCommand({ cluster: clusterArn });
  const listRes = await ecs.send(listCmd);
  if (!listRes.serviceArns || listRes.serviceArns.length === 0) return [];
  const descCmd = new DescribeServicesCommand({ cluster: clusterArn, services: listRes.serviceArns });
  const descRes = await ecs.send(descCmd);
  return (descRes.services || []).map((service: ECSService) => ({
    serviceArn: service.serviceArn || '',
    serviceName: service.serviceName || '',
    clusterArn: service.clusterArn || '',
    taskDefinition: service.taskDefinition || '',
    desiredCount: service.desiredCount || 1,
    launchType: service.launchType,
    tags: service.tags as { [key: string]: string } | undefined,
  }));
}

export async function scanECSTaskDefinitions(region?: string): Promise<ScannedECSTaskDefinition[]> {
  const ecs = new ECSClient({ region });
  const listCmd = new ListTaskDefinitionsCommand({ sort: "DESC" });
  const listRes = await ecs.send(listCmd);
  if (!listRes.taskDefinitionArns || listRes.taskDefinitionArns.length === 0) return [];
  // For MVP, only scan the latest 5 task definitions
  const arns = listRes.taskDefinitionArns.slice(0, 5);
  const defs: ScannedECSTaskDefinition[] = [];
  for (const arn of arns) {
    const descCmd = new DescribeTaskDefinitionCommand({ taskDefinition: arn });
    const descRes = await ecs.send(descCmd);
    const td = descRes.taskDefinition as ECSTaskDefinition | undefined;
    if (td) {
      defs.push({
        taskDefinitionArn: td.taskDefinitionArn || '',
        family: td.family || '',
        containerDefinitions: td.containerDefinitions || [],
        requiresCompatibilities: td.requiresCompatibilities,
        cpu: td.cpu,
        memory: td.memory,
        networkMode: td.networkMode,
        tags: Array.isArray((td as any).tags)
          ? ((td as any).tags as ECSTag[]).reduce((acc: { [key: string]: string }, tag: ECSTag) => {
            if (tag.key && tag.value) acc[tag.key] = tag.value;
            return acc;
          }, {})
          : undefined,
      });
    }
  }
  return defs;
} 