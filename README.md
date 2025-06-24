# console2terraform

A project for scanning existing AWS infrastructure and generating Terraform code.

## Quick Start

1. Install dependencies:
   ```
   npm install
   ```
2. Set up your AWS credentials (via environment variables or AWS profile).
3. Run the project:
   ```
   npx ts-node src/index.ts
   ```

## Structure
- `src/awsConnector.ts` — AWS connection logic
- `src/resourceScanner/` — Modular AWS resources scanning (each resource in its own file, aggregated via `index.ts`)
- `src/resourceMapper/` — Modular mapping AWS data to Terraform structures (each resource in its own file, aggregated via `index.ts`)
- `src/terraformGenerator.ts` — main.tf, provider.tf, variables.tf, outputs.tf generation via EJS templates
- `src/index.ts` — CLI entry point
- `templates/` — EJS templates for Terraform code

## Supported AWS Resources
- **VPC** (`aws_vpc`)
- **Subnet** (`aws_subnet`)
- **Internet Gateway** (`aws_internet_gateway`)
- **Route Table** (`aws_route_table`, `aws_route_table_association`)
- **Security Group** (`aws_security_group`)
- **EC2 Instance** (`aws_instance`)
- **S3 Bucket** (`aws_s3_bucket`)
- **ECS (partial):**
  - **Cluster** (`aws_ecs_cluster`)
  - **Task Definition** (`aws_ecs_task_definition`)
  - **Service** (`aws_ecs_service`)
- **Application Load Balancer (ALB):**
  - **Load Balancer** (`aws_lb`)
  - **Target Group** (`aws_lb_target_group`)
  - **Listener** (`aws_lb_listener`)

## CLI Features
- Scans all supported AWS resources in your account/region.
- Interactive selection of which resource types to include in generated Terraform code.
- Generates the following files:
  - `main.tf` — main Terraform resources
  - `provider.tf` — provider configuration
  - `variables.tf` — input variables
  - `outputs.tf` — outputs for all generated resources
  - `terraform.tfvars` — variable values file (see below)

## Using terraform.tfvars

The `terraform.tfvars` file contains values for variables defined in `variables.tf`. Edit this file to set parameters for your environment (such as bucket names, instance types, etc).

Terraform will automatically load this file when you run `terraform plan` or `terraform apply`.

**Example:**
```
instance_type = "t3.micro"
bucket_name   = "my-bucket-dev"
```

You can also create different files for different environments (e.g., `dev.tfvars`, `prod.tfvars`) and specify them explicitly:
```
terraform apply -var-file=dev.tfvars
```

The `terraform.tfvars` file is generated automatically based on the defined variables. Fill it with your values before running Terraform.

## How it works
1. CLI connects to AWS and scans all supported resources.
2. User selects which resource types to include.
3. Data is mapped to Terraform resource structures.
4. EJS templates generate Terraform files in the project root.

## Extending
- To add support for a new AWS resource:
  1. Add a scanner in `src/resourceScanner/`.
  2. Add a mapper in `src/resourceMapper/`.
  3. Add EJS templates if needed in `templates/`.
  4. Update CLI logic in `src/index.ts` to include the new resource.

## Requirements
- Node.js 18+
- AWS credentials with read permissions for the resources you want to scan

## Using AWS SSO with Account Selection

If your organization uses AWS SSO and you select an account and role via a web interface (the "start" page), you must first configure SSO profiles via the AWS CLI for this CLI application to work:

1. Install AWS CLI v2.
2. Run:
   ```sh
   aws configure sso
   ```
3. Follow the wizard instructions:
   - Enter your SSO Start URL (portal link).
   - Select your SSO Region.
   - Log in via your browser.
   - When prompted to select accounts and roles, choose **all available accounts and roles**.
   - The CLI will create a separate profile in `~/.aws/config` for each account/role.

After this, when you start the application, you will be able to select the desired profile to work with the corresponding AWS account and role. 