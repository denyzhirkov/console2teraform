import { checkConnection } from "./awsConnector";
import { scanEC2, scanS3, scanSecurityGroups, scanVPCs, scanSubnets, scanInternetGateways, scanRouteTables, scanECSClusters, scanECSServices, scanECSTaskDefinitions, scanALBs, scanALBListeners, scanALBTargetGroups } from "./resourceScanner";
import { mapEC2ToTerraform, mapS3ToTerraform, mapSecurityGroupsToTerraform, mapVPCsToTerraform, mapSubnetsToTerraform, mapIGWsToTerraform, mapRouteTablesToTerraform, mapECSClustersToTerraform, mapECSServicesToTerraform, mapECSTaskDefinitionsToTerraform, mapALBsToTerraform, mapALBListenersToTerraform, mapALBTargetGroupsToTerraform } from "./resourceMapper";
import { generateTerraform, generateProviderTf, generateVariablesTf, generateOutputsTf } from "./terraformGenerator";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import os from "os";
import ini from "ini";
import { execSync } from "child_process";

async function selectAwsProfile(): Promise<string> {
  const configPath = path.join(os.homedir(), ".aws/config");
  let profiles: string[] = [];
  if (fs.existsSync(configPath)) {
    const config = ini.parse(fs.readFileSync(configPath, "utf-8"));
    profiles = Object.keys(config)
      .map((section) => section.replace(/^profile /, ""))
      .filter((name) => !!name);
  }
  if (profiles.length === 0) {
    throw new Error("No AWS profiles found in ~/.aws/config. Please configure AWS CLI first.");
  }
  const { selectedProfile } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProfile",
      message: "Select AWS profile to use:",
      choices: profiles,
    },
  ]);
  return selectedProfile;
}

async function main() {
  try {
    // AWS PROFILE SELECTION
    const selectedProfile = await selectAwsProfile();
    process.env.AWS_PROFILE = selectedProfile;
    console.log(`Using AWS profile: ${selectedProfile}`);

    // Check AWS connection
    const identity = await checkConnection();
    console.log(identity);

    // Scan resources in parallel batches of 3 using Promise.all
    // Batch 1: VPCs, Subnets, Internet Gateways
    console.log("Scanning VPCs, Subnets, and Internet Gateways...");
    const [vpcs, subnets, igws] = await Promise.all([
      scanVPCs(),
      scanSubnets(),
      scanInternetGateways()
    ]);
    console.log(`VPCs found: ${vpcs.length}`);
    console.log(`Subnets found: ${subnets.length}`);
    console.log(`Internet Gateways found: ${igws.length}`);

    // Batch 2: Route Tables, EC2, S3
    console.log("Scanning Route Tables, EC2, and S3...");
    const [routeTables, ec2Instances, s3Buckets] = await Promise.all([
      scanRouteTables(),
      scanEC2(),
      scanS3()
    ]);
    console.log(`Route Tables found: ${routeTables.length}`);
    console.log(`EC2 instances found: ${ec2Instances.length}`);
    console.log(`S3 buckets found: ${s3Buckets.length}`);

    // Batch 3: Security Groups, ECS Clusters
    console.log("Scanning Security Groups and ECS Clusters...");
    const [securityGroups, ecsClusters] = await Promise.all([
      scanSecurityGroups(),
      scanECSClusters()
    ]);
    console.log(`Security Groups found: ${securityGroups.length}`);
    console.log(`ECS Clusters found: ${ecsClusters.length}`);

    let ecsServices: any[] = [];
    for (const cluster of ecsClusters) {
      const services = await scanECSServices(cluster.clusterArn);
      ecsServices = ecsServices.concat(services);
    }
    console.log(`ECS Services found: ${ecsServices.length}`);

    console.log("Scanning ECS Task Definitions...");
    const ecsTaskDefs = await scanECSTaskDefinitions();
    console.log(`ECS Task Definitions found: ${ecsTaskDefs.length}`);

    // Scan ALBs
    console.log("Scanning ALBs...");
    const albs = await scanALBs();
    console.log(`ALBs found: ${albs.length}`);
    let albListeners: any[] = [];
    let albTargetGroups: any[] = [];
    for (const alb of albs) {
      const listeners = await scanALBListeners(alb.loadBalancerArn);
      albListeners = albListeners.concat(listeners);
      const tgs = await scanALBTargetGroups(alb.loadBalancerArn);
      albTargetGroups = albTargetGroups.concat(tgs);
    }
    console.log(`ALB Listeners found: ${albListeners.length}`);
    console.log(`ALB Target Groups found: ${albTargetGroups.length}`);

    // Interactive resource type selection
    const resourceTypes = [
      { name: `VPCs (${vpcs.length})`, value: "vpcs", checked: vpcs.length > 0 },
      { name: `Subnets (${subnets.length})`, value: "subnets", checked: subnets.length > 0 },
      { name: `Internet Gateways (${igws.length})`, value: "igws", checked: igws.length > 0 },
      { name: `Route Tables (${routeTables.length})`, value: "routeTables", checked: routeTables.length > 0 },
      { name: `EC2 Instances (${ec2Instances.length})`, value: "ec2", checked: ec2Instances.length > 0 },
      { name: `S3 Buckets (${s3Buckets.length})`, value: "s3", checked: s3Buckets.length > 0 },
      { name: `Security Groups (${securityGroups.length})`, value: "securityGroups", checked: securityGroups.length > 0 },
      { name: `ECS Clusters (${ecsClusters.length})`, value: "ecsClusters", checked: ecsClusters.length > 0 },
      { name: `ECS Services (${ecsServices.length})`, value: "ecsServices", checked: ecsServices.length > 0 },
      { name: `ECS Task Definitions (${ecsTaskDefs.length})`, value: "ecsTaskDefs", checked: ecsTaskDefs.length > 0 },
      { name: `ALBs (${albs.length})`, value: "albs", checked: albs.length > 0 },
      { name: `ALB Listeners (${albListeners.length})`, value: "albListeners", checked: albListeners.length > 0 },
      { name: `ALB Target Groups (${albTargetGroups.length})`, value: "albTargetGroups", checked: albTargetGroups.length > 0 },
    ];
    const { selectedTypes } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedTypes",
        message: "Select resource types to generate in Terraform config:",
        choices: resourceTypes,
      },
    ]);

    // Mapping
    const tfVPCs = selectedTypes.includes("vpcs") ? mapVPCsToTerraform(vpcs) : [];
    const tfSubnets = selectedTypes.includes("subnets") ? mapSubnetsToTerraform(subnets) : [];
    const tfIGWs = selectedTypes.includes("igws") ? mapIGWsToTerraform(igws) : [];
    const tfRouteTables = selectedTypes.includes("routeTables") ? mapRouteTablesToTerraform(routeTables) : [];
    const tfEC2 = selectedTypes.includes("ec2") ? mapEC2ToTerraform(ec2Instances) : [];
    const tfS3 = selectedTypes.includes("s3") ? mapS3ToTerraform(s3Buckets) : [];
    const tfSG = selectedTypes.includes("securityGroups") ? mapSecurityGroupsToTerraform(securityGroups) : [];
    const tfECSClusters = selectedTypes.includes("ecsClusters") ? mapECSClustersToTerraform(ecsClusters) : [];
    const tfECSServices = selectedTypes.includes("ecsServices") ? mapECSServicesToTerraform(ecsServices) : [];
    const tfECSTaskDefs = selectedTypes.includes("ecsTaskDefs") ? mapECSTaskDefinitionsToTerraform(ecsTaskDefs) : [];
    const tfALBs = selectedTypes.includes("albs") ? mapALBsToTerraform(albs) : [];
    const tfALBListeners = selectedTypes.includes("albListeners") ? mapALBListenersToTerraform(albListeners) : [];
    const tfALBTargetGroups = selectedTypes.includes("albTargetGroups") ? mapALBTargetGroupsToTerraform(albTargetGroups) : [];

    // Ensure terraform directory exists
    const tfDir = path.join(__dirname, "../terraform");
    if (!fs.existsSync(tfDir)) {
      fs.mkdirSync(tfDir);
    }

    // Ask user if they want to run terraform import for all generated resources
    const { doImport } = await inquirer.prompt([
      {
        type: "confirm",
        name: "doImport",
        message: "Would you like to automatically run 'terraform import' for all generated resources to link them with the current Terraform state? (Recommended for existing AWS infrastructure)",
        default: false,
      },
    ]);

    // Collect variable/output names for imported resources
    // (MVP: just collect resourceName + fields for selected resources)
    const importedVariableNames = new Set<string>();
    const importedOutputNames = new Set<string>();
    if (doImport) {
      // Example: for all selected resources, add their resourceName + fields (can be extended as needed)
      const allImported = [tfEC2, tfS3, tfSG, tfVPCs, tfSubnets, tfIGWs, tfRouteTables, tfECSClusters, tfECSServices, tfECSTaskDefs, tfALBs, tfALBListeners, tfALBTargetGroups].flat();
      for (const res of allImported) {
        if (res && res.resourceName) {
          // Type guard for vpcId
          if ('vpcId' in res && res.vpcId) importedVariableNames.add(`${res.resourceName}_vpc_id`);
          if ('description' in res && res.description) importedVariableNames.add(`${res.resourceName}_description`);
          if ('arn' in res && res.arn) importedVariableNames.add(`${res.resourceName}_arn`);
          // For outputs similarly
          if ('arn' in res && res.arn) importedOutputNames.add(`${res.resourceName}_arn`);
        }
      }
    }

    // Generate files only after the final user choice, taking into account used names
    await generateTerraform(tfEC2, tfS3, tfSG, tfVPCs, tfSubnets, tfIGWs, tfRouteTables, tfECSClusters, tfECSServices, tfECSTaskDefs, tfALBs, tfALBListeners, tfALBTargetGroups, Array.from(importedVariableNames), Array.from(importedOutputNames));
    await generateProviderTf();
    await generateVariablesTf(
      tfEC2,
      tfS3,
      tfSG,
      tfVPCs,
      tfSubnets,
      tfIGWs,
      tfRouteTables,
      tfECSClusters,
      tfECSServices,
      tfECSTaskDefs,
      tfALBs,
      tfALBListeners,
      tfALBTargetGroups,
      Array.from(importedVariableNames)
    );
    await generateOutputsTf(tfEC2, tfS3, tfSG, tfVPCs, tfSubnets, tfIGWs, tfRouteTables, tfECSClusters, tfECSServices, tfECSTaskDefs, tfALBs, tfALBListeners, tfALBTargetGroups, Array.from(importedOutputNames));
    console.log("Done!");

    if (doImport) {
      await runTerraformImport({
        tfEC2,
        tfS3,
        tfSG,
        tfVPCs,
        tfSubnets,
        tfIGWs,
        tfRouteTables,
        tfECSClusters,
        tfECSServices,
        tfECSTaskDefs,
        tfALBs,
        tfALBListeners,
        tfALBTargetGroups
      });
    }
  } catch (error: any) {
    const errMsg = error?.message || error?.toString() || '';
    if (errMsg.includes('Token is expired') || errMsg.includes('CredentialsProviderError')) {
      const profile = process.env.AWS_PROFILE || '<your-profile>';
      console.error(`\nAWS SSO session is expired or credentials are invalid.\nPlease run:\n  aws sso login --profile ${profile}\nThen restart this program.`);
    } else {
      console.error("Error:", error);
    }
    process.exit(1);
  }
}

async function runTerraformImport(resources: any) {
  const { execSync } = require('child_process');
  const tfDir = path.join(__dirname, '../terraform');
  // Run 'terraform init' if .terraform directory does not exist
  if (!fs.existsSync(path.join(tfDir, '.terraform'))) {
    console.log('Running terraform init...');
    try {
      execSync('terraform init', { cwd: tfDir, stdio: 'inherit' });
    } catch (e: any) {
      console.error('terraform init failed:', e.message);
      return;
    }
  }

  // Helper to run import and log result
  function runImport(cmd: string) {
    try {
      console.log(`\n$ ${cmd}`);
      execSync(cmd, { cwd: tfDir, stdio: 'inherit' });
    } catch (e: any) {
      console.error(`Import failed: ${e.message}`);
    }
  }

  // EC2 Instances
  if (resources.tfEC2) {
    for (const r of resources.tfEC2) {
      if (r.resourceName && r.ami) {
        runImport(`terraform import aws_instance.${r.resourceName} ${r.instanceId}`);
      }
    }
  }
  // S3 Buckets
  if (resources.tfS3) {
    for (const r of resources.tfS3) {
      if (r.resourceName && r.bucket) {
        runImport(`terraform import aws_s3_bucket.${r.resourceName} ${r.bucket}`);
      }
    }
  }
  // VPCs
  if (resources.tfVPCs) {
    for (const r of resources.tfVPCs) {
      if (r.resourceName && r.vpcId) {
        runImport(`terraform import aws_vpc.${r.resourceName} ${r.vpcId}`);
      }
    }
  }
  // Subnets
  if (resources.tfSubnets) {
    for (const r of resources.tfSubnets) {
      if (r.resourceName && r.subnetId) {
        runImport(`terraform import aws_subnet.${r.resourceName} ${r.subnetId}`);
      }
    }
  }
  // Security Groups
  if (resources.tfSG) {
    for (const r of resources.tfSG) {
      if (r.resourceName && r.groupId) {
        runImport(`terraform import aws_security_group.${r.resourceName} ${r.groupId}`);
      }
    }
  }
  // IGWs
  if (resources.tfIGWs) {
    for (const r of resources.tfIGWs) {
      if (r.resourceName && r.igwId) {
        runImport(`terraform import aws_internet_gateway.${r.resourceName} ${r.igwId}`);
      }
    }
  }
  // Route Tables
  if (resources.tfRouteTables) {
    for (const r of resources.tfRouteTables) {
      if (r.resourceName && r.routeTableId) {
        runImport(`terraform import aws_route_table.${r.resourceName} ${r.routeTableId}`);
      }
    }
  }
  // ECS Clusters
  if (resources.tfECSClusters) {
    for (const r of resources.tfECSClusters) {
      if (r.resourceName && r.clusterArn) {
        runImport(`terraform import aws_ecs_cluster.${r.resourceName} ${r.clusterArn}`);
      }
    }
  }
  // ECS Services
  if (resources.tfECSServices) {
    for (const r of resources.tfECSServices) {
      if (r.resourceName && r.clusterArn && r.serviceName) {
        // ECS service import format: cluster_name/service_name
        const clusterName = r.clusterArn.split('/').pop();
        runImport(`terraform import aws_ecs_service.${r.resourceName} ${clusterName}/${r.serviceName}`);
      }
    }
  }
  // ECS Task Definitions
  if (resources.tfECSTaskDefs) {
    for (const r of resources.tfECSTaskDefs) {
      if (r.resourceName && r.taskDefinitionArn) {
        runImport(`terraform import aws_ecs_task_definition.${r.resourceName} ${r.taskDefinitionArn}`);
      }
    }
  }
  // ALBs
  if (resources.tfALBs) {
    for (const r of resources.tfALBs) {
      if (r.resourceName && r.loadBalancerArn) {
        runImport(`terraform import aws_lb.${r.resourceName} ${r.loadBalancerArn}`);
      }
    }
  }
  // ALB Target Groups
  if (resources.tfALBTargetGroups) {
    for (const r of resources.tfALBTargetGroups) {
      if (r.resourceName && r.targetGroupArn) {
        runImport(`terraform import aws_lb_target_group.${r.resourceName} ${r.targetGroupArn}`);
      }
    }
  }
  // ALB Listeners
  if (resources.tfALBListeners) {
    for (const r of resources.tfALBListeners) {
      if (r.resourceName && r.listenerArn) {
        runImport(`terraform import aws_lb_listener.${r.resourceName} ${r.listenerArn}`);
      }
    }
  }
  console.log('\nTerraform import process completed.');
}

main();
