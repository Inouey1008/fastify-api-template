import { CognitoJwtVerifier } from "aws-jwt-verify";

import {
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AdminInitiateAuthCommandOutput,
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
  GetTokensFromRefreshTokenCommandInput,
  GetTokensFromRefreshTokenCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

import { CognitoIdTokenPayload } from "aws-jwt-verify/jwt-model";

interface ICognitoWrapper {
  createToken(
    email: string,
    password: string,
  ): Promise<AdminInitiateAuthCommandOutput>;
  verifyToken(accessToken: string): Promise<CognitoIdTokenPayload>;
  refreshToken(
    refreshToken: string,
  ): Promise<GetTokensFromRefreshTokenCommandOutput>;
}

class CognitoWrapper implements ICognitoWrapper {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.client = new CognitoIdentityProviderClient();
    this.userPoolId = process.env.COGNITO_USER_POOL_ID!;
    this.clientId = process.env.COGNITO_CLIENT_ID!;
  }

  async createToken(
    email: string,
    password: string,
  ): Promise<AdminInitiateAuthCommandOutput> {
    const input: AdminInitiateAuthCommandInput = {
      AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
      UserPoolId: this.userPoolId,
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };
    const command = new AdminInitiateAuthCommand(input);
    const result = await this.client.send(command);
    return result;
  }

  async verifyToken(accessToken: string): Promise<CognitoIdTokenPayload> {
    const accessTokenVerifier = CognitoJwtVerifier.create({
      userPoolId: this.userPoolId,
      clientId: this.clientId,
      tokenUse: "id",
    });
    const result = await accessTokenVerifier.verify(accessToken);
    return result;
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<GetTokensFromRefreshTokenCommandOutput> {
    const input: GetTokensFromRefreshTokenCommandInput = {
      RefreshToken: refreshToken,
      ClientId: this.clientId,
    };
    const command = new GetTokensFromRefreshTokenCommand(input);
    const result = await this.client.send(command);
    return result;
  }
}

export { CognitoWrapper };
export type { ICognitoWrapper };
