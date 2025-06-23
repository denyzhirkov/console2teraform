import ejs from "ejs";
import fs from "fs";
import path from "path";
import { TerraformEC2Resource, TerraformS3Resource, TerraformSecurityGroupResource, TerraformVPCResource, TerraformSubnetResource, TerraformIGWResource, TerraformRouteTableResource, TerraformECSClusterResource, TerraformECSServiceResource, TerraformECSTaskDefinitionResource, TerraformALBResource, TerraformALBListenerResource, TerraformALBTargetGroupResource } from "./resourceMapper";

// Generate main.tf from EJS template and all resource structures
export async function generateTerraform(
  ec2: TerraformEC2Resource[],
  s3: TerraformS3Resource[],
  securityGroups: TerraformSecurityGroupResource[],
  vpcs: TerraformVPCResource[],
  subnets: TerraformSubnetResource[],
  igws: TerraformIGWResource[],
  routeTables: TerraformRouteTableResource[],
  ecsClusters: TerraformECSClusterResource[],
  ecsServices: TerraformECSServiceResource[],
  ecsTaskDefs: TerraformECSTaskDefinitionResource[],
  albs: TerraformALBResource[] = [],
  albListeners: TerraformALBListenerResource[] = [],
  albTargetGroups: TerraformALBTargetGroupResource[] = [],
  outputPath: string = "main.tf"
): Promise<void> {
  const templatePath = path.join(__dirname, "../templates/main.tf.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rendered = ejs.render(template, { ec2, s3, securityGroups, vpcs, subnets, igws, routeTables, ecsClusters, ecsServices, ecsTaskDefs, albs, albListeners, albTargetGroups });
  fs.writeFileSync(outputPath, rendered);
  console.log(`Terraform file generated: ${outputPath}`);
}

// Generate provider.tf from EJS template
export async function generateProviderTf(
  outputPath: string = "provider.tf"
): Promise<void> {
  const templatePath = path.join(__dirname, "../templates/provider.tf.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rendered = ejs.render(template, {});
  fs.writeFileSync(outputPath, rendered);
  console.log(`Terraform file generated: ${outputPath}`);
}

// Generate variables.tf from EJS template
export async function generateVariablesTf(
  outputPath: string = "variables.tf"
): Promise<void> {
  const templatePath = path.join(__dirname, "../templates/variables.tf.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rendered = ejs.render(template, {});
  fs.writeFileSync(outputPath, rendered);
  console.log(`Terraform file generated: ${outputPath}`);
}

// Generate outputs.tf from EJS template
export async function generateOutputsTf(
  ec2: TerraformEC2Resource[],
  s3: TerraformS3Resource[],
  securityGroups: TerraformSecurityGroupResource[],
  vpcs: TerraformVPCResource[],
  subnets: TerraformSubnetResource[],
  igws: TerraformIGWResource[],
  routeTables: TerraformRouteTableResource[],
  ecsClusters: TerraformECSClusterResource[],
  ecsServices: TerraformECSServiceResource[],
  ecsTaskDefs: TerraformECSTaskDefinitionResource[],
  albs: TerraformALBResource[] = [],
  albListeners: TerraformALBListenerResource[] = [],
  albTargetGroups: TerraformALBTargetGroupResource[] = [],
  outputPath: string = "outputs.tf"
): Promise<void> {
  const templatePath = path.join(__dirname, "../templates/outputs.tf.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rendered = ejs.render(template, { ec2, s3, securityGroups, vpcs, subnets, igws, routeTables, ecsClusters, ecsServices, ecsTaskDefs, albs, albListeners, albTargetGroups });
  fs.writeFileSync(outputPath, rendered);
  console.log(`Terraform file generated: ${outputPath}`);
}
