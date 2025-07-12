#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline/pipeline-stack";

const app = new cdk.App();

// CI/CD Pipeline
new PipelineStack(app, "FastifyApiTempletePipeline", {});

// // REST API App
// new ApiStack(app, "FastifyApiTempleteApi", {});

// // Swagger UI
// new SwaggerUIStack(app, "FastifyApiTempleteSwagger", {});
