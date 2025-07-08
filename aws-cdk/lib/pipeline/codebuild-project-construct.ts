import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface CodeBuildProjectProps {
  projectName: string;
  githubUserName: string;
  githubRepoName: string;
  codeconnectionArn: string;
  buildspecPath: codebuild.BuildSpec;
  triggerFilters: codebuild.FilterGroup[];
}

export class CodeBuildProject extends Construct {
  public readonly project: codebuild.Project;

  constructor(scope: Construct, id: string, props: CodeBuildProjectProps) {
    super(scope, id);

    const {
      projectName,
      githubUserName,
      githubRepoName,
      codeconnectionArn,
      buildspecPath,
      triggerFilters,
    } = props;

    this.project = new codebuild.Project(this, "project", {
      projectName: projectName,
      source: codebuild.Source.gitHub({
        owner: githubUserName,
        repo: githubRepoName,
        webhook: true,
        webhookFilters: triggerFilters,
      }),
      environment: {
        computeType: codebuild.ComputeType.SMALL,
        buildImage: codebuild.LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_3_0,
      },
      buildSpec: buildspecPath,
    });

    const policy = new iam.Policy(this, "policy", {
      statements: [
        new iam.PolicyStatement({
          actions: [
            "codestar-connections:GetConnectionToken",
            "codestar-connections:GetConnection",
            "codeconnections:GetConnectionToken",
            "codeconnections:GetConnection",
            "codeconnections:UseConnection",
            "cloudformation:DescribeStacks",
            "cloudformation:GetTemplate",
            "ssm:GetParameter",
          ],
          resources: ["*"],
        }),
        new iam.PolicyStatement({
          actions: ["sts:AssumeRole", "iam:PassRole"],
          resources: ["arn:aws:iam::*:role/cdk-hnb659fds-*"],
        }),
      ],
    });
    this.project.role?.attachInlinePolicy(policy);

    const cfnProject = this.project.node.defaultChild as codebuild.CfnProject;
    const cfnPolicy = policy.node.defaultChild as cdk.CfnResource;
    cfnProject.addDependency(cfnPolicy);

    // L2 Construct は codeconnections をサポートしていないので、L1 Construct を使用する必要あり。
    // https://github.com/aws/aws-cdk/issues/31726
    cfnProject.addPropertyOverride("Source.Auth", {
      Type: "CODECONNECTIONS",
      Resource: codeconnectionArn,
    });
  }
}
