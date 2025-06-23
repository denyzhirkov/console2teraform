import { checkConnection } from "./awsConnector";
import { scanEC2, scanS3, scanSecurityGroups, scanVPCs, scanSubnets, scanInternetGateways, scanRouteTables, scanECSClusters, scanECSServices, scanECSTaskDefinitions, scanALBs, scanALBListeners, scanALBTargetGroups } from "./resourceScanner";
import { mapEC2ToTerraform, mapS3ToTerraform, mapSecurityGroupsToTerraform, mapVPCsToTerraform, mapSubnetsToTerraform, mapIGWsToTerraform, mapRouteTablesToTerraform, mapECSClustersToTerraform, mapECSServicesToTerraform, mapECSTaskDefinitionsToTerraform, mapALBsToTerraform, mapALBListenersToTerraform, mapALBTargetGroupsToTerraform } from "./resourceMapper";
import { generateTerraform, generateProviderTf, generateVariablesTf, generateOutputsTf } from "./terraformGenerator";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

async function main() {
  try {
    // Check AWS connection
    const identity = await checkConnection();
    console.log(identity);

    // Scan resources
    console.log("Scanning VPCs...");
    const vpcs = await scanVPCs();
    console.log(`VPCs found: ${vpcs.length}`);

    console.log("Scanning Subnets...");
    const subnets = await scanSubnets();
    console.log(`Subnets found: ${subnets.length}`);

    console.log("Scanning Internet Gateways...");
    const igws = await scanInternetGateways();
    console.log(`Internet Gateways found: ${igws.length}`);

    console.log("Scanning Route Tables...");
    const routeTables = await scanRouteTables();
    console.log(`Route Tables found: ${routeTables.length}`);

    console.log("Scanning EC2...");
    const ec2Instances = await scanEC2();
    console.log(`EC2 instances found: ${ec2Instances.length}`);

    console.log("Scanning S3...");
    const s3Buckets = await scanS3();
    console.log(`S3 buckets found: ${s3Buckets.length}`);

    console.log("Scanning Security Groups...");
    const securityGroups = await scanSecurityGroups();
    console.log(`Security Groups found: ${securityGroups.length}`);

    console.log("Scanning ECS Clusters...");
    const ecsClusters = await scanECSClusters();
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

    // Generate main.tf
    await generateTerraform(tfEC2, tfS3, tfSG, tfVPCs, tfSubnets, tfIGWs, tfRouteTables, tfECSClusters, tfECSServices, tfECSTaskDefs, tfALBs, tfALBListeners, tfALBTargetGroups);
    // Generate provider.tf
    await generateProviderTf();
    // Generate variables.tf
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
      tfALBTargetGroups
    );
    // Generate outputs.tf
    await generateOutputsTf(tfEC2, tfS3, tfSG, tfVPCs, tfSubnets, tfIGWs, tfRouteTables, tfECSClusters, tfECSServices, tfECSTaskDefs, tfALBs, tfALBListeners, tfALBTargetGroups);
    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
