import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SSM Parameter Store

    // const env = ssm.StringParameter.valueForStringParameter(
    //   this,
    //   "/fastify-api-templete/env",
    // );

    // Lambda Function

    const lambdaFunction = new lambda.DockerImageFunction(
      this,
      "DockerImageLambdaTest",
      {
        functionName: "fastify-api-templete-lambda",
        architecture: lambda.Architecture.ARM_64,
        code: lambda.DockerImageCode.fromImageAsset(
          path.resolve(__dirname, "../../.."),
          {
            file: "api/Dockerfile",
          },
        ),
        // environment: {
        //   ENV: env,
        // },
      },
    );

    // API Gateway

    const api = new apigateway.RestApi(this, "ApiGateway", {
      restApiName: "fastify-api-templete-api",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        statusCode: 200,
      },
    });

    // Rate Limiting and Quota
    api.addUsagePlan("ApiGatewayAnonymousUsagePlan", {
      name: "fastify-api-templete-api-anonymous-access",
      throttle: {
        rateLimit: 20, // 平均5req/sec
        burstLimit: 10, // 一時的に10まで
      },
      quota: {
        limit: 1000, // 1日あたり1000回
        period: apigateway.Period.DAY,
      },
    });

    new apigateway.CfnGatewayResponse(this, "ApiGatewayThrottledResponse", {
      restApiId: api.restApiId,
      responseType: "THROTTLED",
      responseTemplates: {
        "application/json": JSON.stringify({
          statusCode: 429,
          error: "Too Many Requests",
          message: "Rate limit exceeded",
        }),
      },
      statusCode: "429",
    });

    new apigateway.CfnGatewayResponse(this, "ApiGatewayQuotaExceededResponse", {
      restApiId: api.restApiId,
      responseType: "QUOTA_EXCEEDED",
      responseTemplates: {
        "application/json": JSON.stringify({
          statusCode: 429,
          error: "Too Many Requests",
          message: "Quota Exceeded",
        }),
      },
      statusCode: "429",
    });

    // 4XX 一般エラー
    new apigateway.CfnGatewayResponse(this, "ApiGatewayDefault4xxResponse", {
      restApiId: api.restApiId,
      responseType: "DEFAULT_4XX",
      responseTemplates: {
        "application/json": JSON.stringify({
          statusCode: 400,
          error: "Bad Request",
          message: "Client error",
        }),
      },
      statusCode: "400",
    });

    // 5XX 一般エラー
    new apigateway.CfnGatewayResponse(this, "ApiGatewayDefault5xxResponse", {
      restApiId: api.restApiId,
      responseType: "DEFAULT_5XX",
      responseTemplates: {
        "application/json": JSON.stringify({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Something went wrong",
        }),
      },
      statusCode: "500",
    });

    // Lambda Integration

    const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    const proxy = api.root.addResource("{proxy+}");
    proxy.addMethod("ANY", lambdaIntegration);

    // DynamoDB

    const table = new dynamodb.Table(this, "ContactTable", {
      tableName: `fastify-api-templete-contact-table`,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    table.grantReadWriteData(lambdaFunction);

    // Cognito

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `fastify-api-templete-user-pool`,
      signInAliases: { email: true },
      selfSignUpEnabled: true,
      passwordPolicy: {
        minLength: 8,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    // リフレッシュトークンのローテション設定は、対応中のステータスのようだ。そのため、下記の PR がマージされるまで手動設定する方針で進める。
    // https://github.com/aws/aws-cdk/pull/34360

    const cognitoClient = new cognito.UserPoolClient(this, "AppClient", {
      userPoolClientName: `fastify-api-templete-user-pool-client`,
      userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
      },
    });

    lambdaFunction.addEnvironment("COGNITO_USER_POOL_ID", userPool.userPoolId);
    lambdaFunction.addEnvironment(
      "COGNITO_CLIENT_ID",
      cognitoClient.userPoolClientId,
    );
  }
}
