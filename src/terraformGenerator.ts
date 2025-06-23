import ejs from "ejs";
import fs from "fs";
import path from "path";
import { TerraformEC2Resource, TerraformS3Resource, TerraformSecurityGroupResource, TerraformVPCResource, TerraformSubnetResource, TerraformIGWResource, TerraformRouteTableResource, TerraformECSClusterResource, TerraformECSServiceResource, TerraformECSTaskDefinitionResource, TerraformALBResource, TerraformALBListenerResource, TerraformALBTargetGroupResource } from "./resourceMapper";

const resourceTemplates = [
  { key: "ec2", file: "main.ec2.tf.ejs" },
  { key: "s3", file: "main.s3.tf.ejs" },
  { key: "securityGroups", file: "main.securityGroup.tf.ejs" },
  { key: "vpcs", file: "main.vpc.tf.ejs" },
  { key: "subnets", file: "main.subnet.tf.ejs" },
  { key: "igws", file: "main.igw.tf.ejs" },
  { key: "routeTables", file: "main.routeTable.tf.ejs" },
  { key: "ecsClusters", file: "main.ecsCluster.tf.ejs" },
  { key: "ecsServices", file: "main.ecsService.tf.ejs" },
  { key: "ecsTaskDefs", file: "main.ecsTaskDef.tf.ejs" },
  { key: "albs", file: "main.alb.tf.ejs" },
  { key: "albListeners", file: "main.albListener.tf.ejs" },
  { key: "albTargetGroups", file: "main.albTargetGroup.tf.ejs" },
];

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
  outputPath: string = "terraform/main.tf"
): Promise<void> {
  const allData: Record<string, any> = { ec2, s3, securityGroups, vpcs, subnets, igws, routeTables, ecsClusters, ecsServices, ecsTaskDefs, albs, albListeners, albTargetGroups };
  let mainTf = "";
  for (const { key, file } of resourceTemplates) {
    if (allData[key] && allData[key].length) {
      const templatePath = path.join(__dirname, "../templates/" + file);
      const template = fs.readFileSync(templatePath, "utf-8");
      mainTf += ejs.render(template, allData) + "\n";
    }
  }
  fs.writeFileSync(outputPath, mainTf);
  console.log(`Terraform file generated: ${outputPath}`);
}

// Generate provider.tf from EJS template
export async function generateProviderTf(
  outputPath: string = "terraform/provider.tf"
): Promise<void> {
  const templatePath = path.join(__dirname, "../templates/provider.tf.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rendered = ejs.render(template, {});
  fs.writeFileSync(outputPath, rendered);
  console.log(`Terraform file generated: ${outputPath}`);
}

// Generate variables.tf from EJS template
export async function generateVariablesTf(
  outputPath: string = "terraform/variables.tf"
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
  outputPath: string = "terraform/outputs.tf"
): Promise<void> {
  const templatePath = path.join(__dirname, "../templates/outputs.tf.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rendered = ejs.render(template, { ec2, s3, securityGroups, vpcs, subnets, igws, routeTables, ecsClusters, ecsServices, ecsTaskDefs, albs, albListeners, albTargetGroups });
  fs.writeFileSync(outputPath, rendered);
  console.log(`Terraform file generated: ${outputPath}`);
}
