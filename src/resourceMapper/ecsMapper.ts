import { ScannedECSCluster, ScannedECSService, ScannedECSTaskDefinition } from '../resourceScanner';

export interface TerraformECSClusterResource {
  resourceName: string;
  clusterArn: string;
  status: string;
  tags?: { [key: string]: string };
}

export interface TerraformECSServiceResource {
  resourceName: string;
  serviceArn: string;
  serviceName: string;
  clusterArn: string;
  taskDefinition: string;
  desiredCount: number;
  launchType?: string;
  tags?: { [key: string]: string };
}

export interface TerraformECSTaskDefinitionResource {
  resourceName: string;
  taskDefinitionArn: string;
  family: string;
  containerDefinitions: any[];
  requiresCompatibilities?: string[];
  cpu?: string;
  memory?: string;
  networkMode?: string;
  tags?: { [key: string]: string };
}

export function mapECSClustersToTerraform(clusters: ScannedECSCluster[]): TerraformECSClusterResource[] {
  return clusters.map((cluster, idx) => ({
    resourceName: cluster.clusterName.replace(/[^a-zA-Z0-9_]/g, '_') || `ecs_cluster_${idx + 1}`,
    clusterArn: cluster.clusterArn,
    status: cluster.status,
    tags: cluster.tags,
  }));
}

export function mapECSServicesToTerraform(services: ScannedECSService[]): TerraformECSServiceResource[] {
  return services.map((service, idx) => ({
    resourceName: service.serviceName.replace(/[^a-zA-Z0-9_]/g, '_') || `ecs_service_${idx + 1}`,
    serviceArn: service.serviceArn,
    serviceName: service.serviceName,
    clusterArn: service.clusterArn,
    taskDefinition: service.taskDefinition,
    desiredCount: service.desiredCount,
    launchType: service.launchType,
    tags: service.tags,
  }));
}

export function mapECSTaskDefinitionsToTerraform(defs: ScannedECSTaskDefinition[]): TerraformECSTaskDefinitionResource[] {
  return defs.map((def, idx) => ({
    resourceName: def.family.replace(/[^a-zA-Z0-9_]/g, '_') || `ecs_taskdef_${idx + 1}`,
    taskDefinitionArn: def.taskDefinitionArn,
    family: def.family,
    containerDefinitions: def.containerDefinitions,
    requiresCompatibilities: def.requiresCompatibilities,
    cpu: def.cpu,
    memory: def.memory,
    networkMode: def.networkMode,
    tags: def.tags,
  }));
} 