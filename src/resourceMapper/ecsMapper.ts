import { ScannedECSCluster, ScannedECSService, ScannedECSTaskDefinition } from '../resourceScanner';

export interface TerraformECSClusterResource {
  resourceName: string;
  clusterArn: string;
  status: string;
  tags?: { [key: string]: string };
  tagsHcl?: string;
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
  tagsHcl?: string;
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
  tagsHcl?: string;
  containerDefinitionsHcl?: string;
  requiresCompatibilitiesHcl?: string;
}

export function mapECSClustersToTerraform(clusters: ScannedECSCluster[]): TerraformECSClusterResource[] {
  return clusters.map((cluster, idx) => {
    const tags = cluster.tags || {};
    return {
      resourceName: cluster.clusterName.replace(/[^a-zA-Z0-9_]/g, '_') || `ecs_cluster_${idx + 1}`,
      clusterArn: cluster.clusterArn,
      status: cluster.status,
      tags,
      tagsHcl: Object.entries(tags).map(([k, v]) => `${k} = "${v}"`).join('\n    '),
    };
  });
}

export function mapECSServicesToTerraform(services: ScannedECSService[]): TerraformECSServiceResource[] {
  return services.map((service, idx) => {
    const tags = service.tags || {};
    return {
      resourceName: service.serviceName.replace(/[^a-zA-Z0-9_]/g, '_') || `ecs_service_${idx + 1}`,
      serviceArn: service.serviceArn,
      serviceName: service.serviceName,
      clusterArn: service.clusterArn,
      taskDefinition: service.taskDefinition,
      desiredCount: service.desiredCount,
      launchType: service.launchType,
      tags,
      tagsHcl: Object.entries(tags).map(([k, v]) => `${k} = "${v}"`).join('\n    '),
    };
  });
}

export function mapECSTaskDefinitionsToTerraform(defs: ScannedECSTaskDefinition[]): TerraformECSTaskDefinitionResource[] {
  return defs.map((def, idx) => {
    const tags = def.tags || {};
    return {
      resourceName: def.family.replace(/[^a-zA-Z0-9_]/g, '_') || `ecs_taskdef_${idx + 1}`,
      taskDefinitionArn: def.taskDefinitionArn,
      family: def.family,
      containerDefinitions: def.containerDefinitions,
      requiresCompatibilities: def.requiresCompatibilities,
      cpu: def.cpu,
      memory: def.memory,
      networkMode: def.networkMode,
      tags,
      tagsHcl: Object.entries(tags).map(([k, v]) => `${k} = "${v}"`).join('\n    '),
      containerDefinitionsHcl: JSON.stringify(def.containerDefinitions),
      requiresCompatibilitiesHcl: def.requiresCompatibilities ? JSON.stringify(def.requiresCompatibilities) : undefined,
    };
  });
} 