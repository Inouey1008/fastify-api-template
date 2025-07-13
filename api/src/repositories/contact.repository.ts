import {
  DeleteCommand,
  DeleteCommandInput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  NativeAttributeValue,
  PutCommand,
  PutCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { httpErrors } from "@fastify/sensible";
import { ContactEntity } from "models/contact.model";
import { Sort } from "models/query-parts.model";

export interface IContactRepository {
  fetch(id: string): Promise<ContactEntity | undefined>;
  fetchList(
    from: string | undefined,
    to: string | undefined,
    sort: Sort | undefined,
    limit: number | undefined,
  ): Promise<ContactEntity[]>;
  create(contact: ContactEntity): Promise<ContactEntity>;
  update(contact: ContactEntity): Promise<ContactEntity>;
  delete(id: string): Promise<void>;
}

export class ContactRepository implements IContactRepository {
  private dynamodb: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    this.dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient());
    this.tableName = "fastify-api-templete-contact-table";
  }

  async fetch(id: string): Promise<ContactEntity | undefined> {
    const input: GetCommandInput = {
      TableName: this.tableName,
      Key: { id },
    };

    const command = new GetCommand(input);

    const result = await this.dynamodb.send(command);
    return result.Item as ContactEntity | undefined;
  }

  async fetchList(
    from: string | undefined,
    to: string | undefined,
    sort: Sort | undefined,
    limit: number | undefined,
  ): Promise<ContactEntity[]> {
    const indexName = "userid-timestamp-index";
    const userID = "DUMMY_USER_ID";

    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: indexName,
      ScanIndexForward: sort === undefined ? false : sort !== Sort.DESC,
    };

    if (from && to) {
      params.KeyConditionExpression =
        "userID = :userID AND #ts BETWEEN :from AND :to";
      params.ExpressionAttributeNames = { "#ts": "timestamp" };
      params.ExpressionAttributeValues = marshall({
        ":userID": userID,
        ":from": from,
        ":to": to,
      });
    } else if (from) {
      params.KeyConditionExpression = "userID = :userID AND #ts >= :from";
      params.ExpressionAttributeNames = { "#ts": "timestamp" };
      params.ExpressionAttributeValues = marshall({
        ":userID": userID,
        ":from": from,
      });
    } else if (to) {
      params.KeyConditionExpression = "userID = :userID AND #ts <= :to";
      params.ExpressionAttributeNames = { "#ts": "timestamp" };
      params.ExpressionAttributeValues = marshall({
        ":userID": userID,
        ":to": to,
      });
    } else {
      params.KeyConditionExpression = "userID = :userID";
      params.ExpressionAttributeValues = marshall({ ":userID": userID });
    }

    if (limit) {
      params.Limit = limit;
    }

    // Send the query command to DynamoDB
    try {
      const command = new QueryCommand(params);
      const result: QueryCommandOutput = await this.dynamodb.send(command);
      const items = result.Items?.map((item) => unmarshall(item));
      return items as ContactEntity[];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw httpErrors.internalServerError("Failed to fetch contacts");
    }
  }

  async update(contact: ContactEntity): Promise<ContactEntity> {
    const updateExpressions: string[] = [];
    const attributeNames: Record<string, string> = {};
    const attributeValues: Record<string, NativeAttributeValue> = {};

    Object.entries(contact).forEach(([key, value]) => {
      if (key !== "id") {
        const nameKey = `#${key}`;
        const valueKey = `:${key}`;
        updateExpressions.push(`${nameKey} = ${valueKey}`);
        attributeNames[nameKey] = key;
        attributeValues[valueKey] = value;
      }
    });
    const input: UpdateCommandInput = {
      TableName: this.tableName,
      Key: { id: contact.id },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ConditionExpression: "attribute_exists(id)",
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ReturnValues: "ALL_NEW",
    };

    const command = new UpdateCommand(input);

    try {
      const output = await this.dynamodb.send(command);
      return output.Attributes as ContactEntity;
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException) {
        throw httpErrors.notFound();
      }
      throw e;
    }
  }

  async create(contact: ContactEntity): Promise<ContactEntity> {
    const input: PutCommandInput = {
      TableName: this.tableName,
      Item: contact,
      ConditionExpression: "attribute_not_exists(id)",
    };

    const command = new PutCommand(input);

    try {
      await this.dynamodb.send(command);
      return contact;
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException) {
        throw httpErrors.conflict();
      }
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    const input: DeleteCommandInput = {
      TableName: this.tableName,
      Key: { id },
      ConditionExpression: "attribute_exists(id)",
    };

    const command = new DeleteCommand(input);

    try {
      await this.dynamodb.send(command);
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException) {
        throw httpErrors.notFound();
      }
      throw e;
    }
  }
}
