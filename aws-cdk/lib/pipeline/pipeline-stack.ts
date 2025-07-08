import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { CodeBuildProject } from "./codebuild-project-construct";

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SSM Parameter Store

    const codeconnectionArn = ssm.StringParameter.valueForStringParameter(
      this,
      "/codebuild/codeconnection/inouey1008/arn",
    );

    // CodeBuild Project

    new CodeBuildProject(this, "SwaggerDeploymentProject", {
      projectName: "fastify-api-templete-swagger-deployment",
      githubUserName: "Inouey1008",
      githubRepoName: "fastify-api-template",
      codeconnectionArn: codeconnectionArn,
      buildspecPath: codebuild.BuildSpec.fromSourceFilename(
        "swagger-ui/buildspec.yml",
      ),
      triggerFilters: [
        codebuild.FilterGroup.inEventOf(
          codebuild.EventAction.PUSH,
          codebuild.EventAction.PULL_REQUEST_MERGED,
        ).andHeadRefIs("refs/heads/main"),
      ],
    });
  }
}
