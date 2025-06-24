import ejs from "ejs";
import fs from "fs";
import path from "path";
import { TerraformEC2Resource, TerraformS3Resource, TerraformSecurityGroupResource, TerraformVPCResource, TerraformSubnetResource, TerraformIGWResource, TerraformRouteTableResource, TerraformECSClusterResource, TerraformECSServiceResource, TerraformECSTaskDefinitionResource, TerraformALBResource, TerraformALBListenerResource, TerraformALBTargetGroupResource } from "./resourceMapper";

const resourceTemplates = [
  { key: "ec2", file: "main/main.ec2.tf.ejs" },
  { key: "s3", file: "main/main.s3.tf.ejs" },
  { key: "securityGroups", file: "main/main.securityGroup.tf.ejs" },
  { key: "vpcs", file: "main/main.vpc.tf.ejs" },
  { key: "subnets", file: "main/main.subnet.tf.ejs" },
  { key: "igws", file: "main/main.igw.tf.ejs" },
  { key: "routeTables", file: "main/main.routeTable.tf.ejs" },
  { key: "ecsClusters", file: "main/main.ecsCluster.tf.ejs" },
  { key: "ecsServices", file: "main/main.ecsService.tf.ejs" },
  { key: "ecsTaskDefs", file: "main/main.ecsTaskDef.tf.ejs" },
  { key: "albs", file: "main/main.alb.tf.ejs" },
  { key: "albListeners", file: "main/main.albListener.tf.ejs" },
  { key: "albTargetGroups", file: "main/main.albTargetGroup.tf.ejs" },
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
  const templatePath = path.join(__dirname, "../templates/common/provider.tf.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rendered = ejs.render(template, {});
  fs.writeFileSync(outputPath, rendered);
  console.log(`Terraform file generated: ${outputPath}`);
}

// Generate variables.tf from EJS template
export async function generateVariablesTf(
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
): Promise<void> {
  // EC2 variables
  const ec2VarsTemplatePath = path.join(__dirname, "../templates/variables/variables_ec2.tf.ejs");
  const ec2VarsTemplate = fs.readFileSync(ec2VarsTemplatePath, "utf-8");
  const ec2VarsRendered = ejs.render(ec2VarsTemplate, { ec2 });
  fs.writeFileSync("terraform/variables_ec2.tf", ec2VarsRendered);

  // VPC variables
  const vpcVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_vpc.tf.ejs");
  const vpcVarsTemplate = fs.readFileSync(vpcVarsTemplatePath, "utf-8");
  const vpcVarsRendered = ejs.render(vpcVarsTemplate, { vpcs });
  fs.writeFileSync("terraform/variables_vpc.tf", vpcVarsRendered);

  // Update paths for other resources similarly:
  const subnetVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_subnet.tf.ejs");
  const subnetVarsTemplate = fs.readFileSync(subnetVarsTemplatePath, "utf-8");
  const subnetVarsRendered = ejs.render(subnetVarsTemplate, { subnets });
  fs.writeFileSync("terraform/variables_subnet.tf", subnetVarsRendered);

  const igwVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_igw.tf.ejs");
  const igwVarsTemplate = fs.readFileSync(igwVarsTemplatePath, "utf-8");
  const igwVarsRendered = ejs.render(igwVarsTemplate, { igws });
  fs.writeFileSync("terraform/variables_igw.tf", igwVarsRendered);

  const routeTableVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_routeTable.tf.ejs");
  const routeTableVarsTemplate = fs.readFileSync(routeTableVarsTemplatePath, "utf-8");
  const routeTableVarsRendered = ejs.render(routeTableVarsTemplate, { routeTables });
  fs.writeFileSync("terraform/variables_routeTable.tf", routeTableVarsRendered);

  const securityGroupVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_securityGroup.tf.ejs");
  const securityGroupVarsTemplate = fs.readFileSync(securityGroupVarsTemplatePath, "utf-8");
  const securityGroupVarsRendered = ejs.render(securityGroupVarsTemplate, { securityGroups });
  fs.writeFileSync("terraform/variables_securityGroup.tf", securityGroupVarsRendered);

  const s3VarsTemplatePath = path.join(__dirname, "../templates/variables/variables_s3.tf.ejs");
  const s3VarsTemplate = fs.readFileSync(s3VarsTemplatePath, "utf-8");
  const s3VarsRendered = ejs.render(s3VarsTemplate, { s3 });
  fs.writeFileSync("terraform/variables_s3.tf", s3VarsRendered);

  // ECS Cluster
  const ecsClusterVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_ecsCluster.tf.ejs");
  const ecsClusterVarsTemplate = fs.readFileSync(ecsClusterVarsTemplatePath, "utf-8");
  const ecsClusterVarsRendered = ejs.render(ecsClusterVarsTemplate, { ecsClusters });
  fs.writeFileSync("terraform/variables_ecsCluster.tf", ecsClusterVarsRendered);

  // ECS Service
  const ecsServiceVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_ecsService.tf.ejs");
  const ecsServiceVarsTemplate = fs.readFileSync(ecsServiceVarsTemplatePath, "utf-8");
  const ecsServiceVarsRendered = ejs.render(ecsServiceVarsTemplate, { ecsServices });
  fs.writeFileSync("terraform/variables_ecsService.tf", ecsServiceVarsRendered);

  // ECS TaskDef
  const ecsTaskDefVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_ecsTaskDef.tf.ejs");
  const ecsTaskDefVarsTemplate = fs.readFileSync(ecsTaskDefVarsTemplatePath, "utf-8");
  const ecsTaskDefVarsRendered = ejs.render(ecsTaskDefVarsTemplate, { ecsTaskDefs });
  fs.writeFileSync("terraform/variables_ecsTaskDef.tf", ecsTaskDefVarsRendered);

  // ALB
  const albVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_alb.tf.ejs");
  const albVarsTemplate = fs.readFileSync(albVarsTemplatePath, "utf-8");
  const albVarsRendered = ejs.render(albVarsTemplate, { albs });
  fs.writeFileSync("terraform/variables_alb.tf", albVarsRendered);

  // ALB Target Group
  const albTargetGroupVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_albTargetGroup.tf.ejs");
  const albTargetGroupVarsTemplate = fs.readFileSync(albTargetGroupVarsTemplatePath, "utf-8");
  const albTargetGroupVarsRendered = ejs.render(albTargetGroupVarsTemplate, { albTargetGroups });
  fs.writeFileSync("terraform/variables_albTargetGroup.tf", albTargetGroupVarsRendered);

  // ALB Listener
  const albListenerVarsTemplatePath = path.join(__dirname, "../templates/variables/variables_albListener.tf.ejs");
  const albListenerVarsTemplate = fs.readFileSync(albListenerVarsTemplatePath, "utf-8");
  const albListenerVarsRendered = ejs.render(albListenerVarsTemplate, { albListeners });
  fs.writeFileSync("terraform/variables_albListener.tf", albListenerVarsRendered);

  // Main variables.tf (if needed)
  const variablesTfTemplatePath = path.join(__dirname, "../templates/variables/variables.tf.ejs");
  let allVariables: { name: string, default?: string }[] = [];
  if (fs.existsSync(variablesTfTemplatePath)) {
    const variablesTfTemplate = fs.readFileSync(variablesTfTemplatePath, "utf-8");
    const variablesTfRendered = ejs.render(variablesTfTemplate, { ec2, s3, securityGroups, vpcs, subnets, igws, routeTables });
    fs.writeFileSync("terraform/variables.tf", variablesTfRendered);
    // Try to extract variable names from the template (or from data)
    // For simplicity: if the template contains <% variables.forEach ... %>, pass the variables array
    // Otherwise, collect manually (or leave empty)
    // Here we assume variables are defined in variablesTfRendered as: variable "name" { ... default = "value" ... }
    // If no variables found — do not generate tfvars
    const varRegex = /variable\s+"([^"]+)"[^{]*{[^}]*default\s*=\s*"([^"]*)"/g;
    let match;
    while ((match = varRegex.exec(variablesTfRendered)) !== null) {
      allVariables.push({ name: match[1], default: match[2] });
    }
  }
  // Если не нашли переменные — не генерируем tfvars
  if (allVariables.length > 0) {
    await generateTfvarsFile(allVariables);
  }
  console.log(`Terraform variable files generated.`);
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
  const templatePath = path.join(__dirname, "../templates/common/outputs.tf.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rendered = ejs.render(template, { ec2, s3, securityGroups, vpcs, subnets, igws, routeTables, ecsClusters, ecsServices, ecsTaskDefs, albs, albListeners, albTargetGroups });
  fs.writeFileSync(outputPath, rendered);
  console.log(`Terraform file generated: ${outputPath}`);
}

export async function generateTfvarsFile(variables: { name: string, default?: string }[], outputPath: string = "terraform/terraform.tfvars") {
  const templatePath = path.join(__dirname, "../templates/variables/terraform.tfvars.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rendered = ejs.render(template, { variables });
  fs.writeFileSync(outputPath, rendered);
  console.log(`Terraform tfvars file generated: ${outputPath}`);
}
