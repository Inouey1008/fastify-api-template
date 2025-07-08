import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class SwaggerUIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket

    const bucket = new s3.Bucket(this, "SwaggerUIBucket", {
      bucketName: "aws-codebuild-test-swagger-hosting-bucket",
      websiteIndexDocument: "index.html",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
    });

    // CloudFront Function for Basic Authentication
    const basicAuthFunction = new cloudfront.Function(
      this,
      "SwaggerUIBasicAuthFunction",
      {
        code: cloudfront.FunctionCode.fromFile({
          filePath: "../swagger-ui/src/basic-auth.js",
        }),
      },
    );

    // CloudFront

    const distribution = new cloudfront.Distribution(
      this,
      "SwaggerUIDistribution",
      {
        defaultBehavior: {
          origin:
            cloudfront_origins.S3BucketOrigin.withOriginAccessControl(bucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          functionAssociations: [
            {
              function: basicAuthFunction,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            },
          ],
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
        defaultRootObject: "index.html",
      },
    );

    // Deploy Swagger UI files to S3 bucket

    new s3deploy.BucketDeployment(this, "SwaggerUIDeployment", {
      sources: [s3deploy.Source.asset("../swagger-ui/src/static")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
      cacheControl: [s3deploy.CacheControl.noCache()],
    });

    // Output

    new cdk.CfnOutput(this, "SwaggerUIURL", {
      value: distribution.domainName,
      description: "CloudFront SwaggerUI URL:",
    });
  }
}
