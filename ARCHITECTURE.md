# Project Architecture Overview

This document provides a minimal description of the application's structure and the responsibility of each main file/folder.

## Folders and Files

- **src/awsConnector.ts**
  - Handles AWS connection logic (credentials, region, clients).
  - Used by all resource scanners to access AWS services.

- **src/resourceScanner.ts**
  - Scans AWS resources (see Supported AWS Resources below).
  - Uses awsConnector to get AWS clients.
  - Returns raw resource data for mapping.

- **src/resourceMapper.ts**
  - Maps scanned AWS data to Terraform resource structures.
  - Used by the generator to prepare data for templates.

- **src/terraformGenerator.ts**
  - Generates Terraform files (main.tf, outputs.tf, etc.) from mapped data.
  - Uses EJS templates from the `templates/` folder.

- **src/index.ts**
  - CLI entry point.
  - Orchestrates the process: connect → scan → (interactive selection) → map → generate.

- **templates/**
  - Contains EJS templates for Terraform code generation.

- **README.md**
  - General project info and usage instructions.

- **ARCHITECTURE.md**
  - (This file) Minimal architecture and file responsibility overview.

---

## Supported AWS Resources (scanned and generated)

- **VPC** (`aws_vpc`)
- **Subnet** (`aws_subnet`)
- **Internet Gateway** (`aws_internet_gateway`)
- **Route Table** (`aws_route_table`, `aws_route_table_association`)
- **Security Group** (`aws_security_group`)
- **EC2 Instance** (`aws_instance`)
- **S3 Bucket** (`aws_s3_bucket`)
- **ECS (partial support):**
  - **Cluster** (`aws_ecs_cluster`)
  - **Task Definition** (`aws_ecs_task_definition`)
  - **Service** (`aws_ecs_service`)
- **Application Load Balancer (ALB):**
  - **Load Balancer** (`aws_lb`)
  - **Target Group** (`aws_lb_target_group`)
  - **Listener** (`aws_lb_listener`)

---

## ECS: What is implemented and what can be improved

**Implemented:**
- Scanning and generation for ECS Clusters, Task Definitions (latest 5), and Services.
- Basic mapping of ECS resources to Terraform.
- Outputs for ECS resources (cluster id, service id, task definition arn).
- Interactive selection in CLI.
- ALB (Application Load Balancer) now supported as a separate resource (scanning, mapping, generation, outputs).
- Manual integration of ALB with ECS Service is possible via Terraform.

**Potential improvements:**
- Deeper support for:
  - Load Balancers (ALB/NLB) integration with ECS Service (automation planned)
  - IAM roles and policies for ECS tasks
  - Fargate-specific settings
  - Environment variables, secrets, logging, volumes
  - Networking (awsvpc mode, security groups, subnets)
  - Autoscaling, placement strategies, capacity providers
  - More advanced task definition options (sidecars, resource limits, etc.)
- Support for all task definitions (not только последние 5)
- Cross-resource references (linking ECS to other generated resources)

---

## Potential Future Resources (not yet covered)

- NAT Gateway (`aws_nat_gateway`)
- Elastic IP (`aws_eip`)
- Network ACL (`aws_network_acl`)
- VPC Peering (`aws_vpc_peering_connection`)
- RDS (`aws_db_instance`)
- Lambda (`aws_lambda_function`)
- IAM (roles, policies, users)
- CloudWatch, SNS, SQS, etc.
- ...and any other AWS resources as needed
 