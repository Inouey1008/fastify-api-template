#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api/api-stack";
import { PipelineStack } from "../lib/pipeline/pipeline-stack";
import { SwaggerUIStack } from "../lib/swagger-ui/swagger-ui-stack";

const app = new cdk.App();

// CI/CD Pipeline
new PipelineStack(app, "FastifyApiTempletePipeline", {});

// REST API App
new ApiStack(app, "FastifyApiTempleteApi", {});

// Swagger UI
new SwaggerUIStack(app, "FastifyApiTempleteSwagger", {});
