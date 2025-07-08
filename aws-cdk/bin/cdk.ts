#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline/pipeline-stack";
import { SwaggerUIStack } from "../lib/swagger-ui/swagger-ui-stack";

const app = new cdk.App();

// CI/CD Pipeline
new PipelineStack(app, "FastifyApiTempletePipeline", {});

// Swagger UI
new SwaggerUIStack(app, "FastifyApiTempleteSwagger", {});
