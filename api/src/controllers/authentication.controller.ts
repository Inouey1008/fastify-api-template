import {
  ExpiredCodeException,
  LimitExceededException,
  NotAuthorizedException,
  TooManyRequestsException,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { httpErrors } from "@fastify/sensible";
import { AuthenticationTokenDTO } from "models/authentication.model";
import { ICognitoWrapper } from "wrappers/cognito.wrapper";

export interface IAuthenticationController {
  create(email: string, password: string): Promise<AuthenticationTokenDTO>;
  refresh(refreshToken: string): Promise<AuthenticationTokenDTO>;
}

export class AuthenticationController implements IAuthenticationController {
  private cognito: ICognitoWrapper;

  constructor(cognito: ICognitoWrapper) {
    this.cognito = cognito;
  }

  async create(
    email: string,
    password: string,
  ): Promise<AuthenticationTokenDTO> {
    try {
      const result = await this.cognito.createToken(email, password);
      const charrenge = result.ChallengeName;
      if (charrenge === "NEW_PASSWORD_REQUIRED") {
        throw httpErrors.forbidden("New password required");
      }

      const authenticationResult = result.AuthenticationResult;
      const accessToken = authenticationResult?.AccessToken;
      const refreshToken = authenticationResult?.RefreshToken;
      if (!accessToken || !refreshToken) {
        throw httpErrors.forbidden("No token returned");
      }

      const authToken: AuthenticationTokenDTO = {
        accessToken,
        refreshToken,
      };
      return authToken;
    } catch (e) {
      if (e instanceof NotAuthorizedException) {
        throw httpErrors.unauthorized("Invalid credentials");
      }
      if (e instanceof TooManyRequestsException) {
        throw httpErrors.tooManyRequests("Too many requests");
      }
      if (e instanceof LimitExceededException) {
        throw httpErrors.tooManyRequests("Too many requests");
      }
      if (e instanceof UserNotFoundException) {
        throw httpErrors.notFound("User not found");
      }
      if (e instanceof ExpiredCodeException) {
        throw httpErrors.badRequest("Expired code");
      }
      throw e;
    }
  }

  async refresh(refreshToken: string): Promise<AuthenticationTokenDTO> {
    try {
      const result = await this.cognito.refreshToken(refreshToken);
      const authenticationResult = result.AuthenticationResult;
      const newAccessToken = authenticationResult?.AccessToken;
      const newRefreshToken = authenticationResult?.RefreshToken;
      if (!newAccessToken || !newRefreshToken) {
        throw httpErrors.forbidden("No token returned");
      }
      const authToken: AuthenticationTokenDTO = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
      return authToken;
    } catch (e) {
      if (e instanceof NotAuthorizedException) {
        throw httpErrors.unauthorized("Invalid credentials");
      }
      if (e instanceof TooManyRequestsException) {
        throw httpErrors.tooManyRequests("Too many requests");
      }
      if (e instanceof LimitExceededException) {
        throw httpErrors.tooManyRequests("Too many requests");
      }
      if (e instanceof UserNotFoundException) {
        throw httpErrors.notFound("User not found");
      }
      if (e instanceof ExpiredCodeException) {
        throw httpErrors.badRequest("Expired code");
      }
      throw e;
    }
  }
}
