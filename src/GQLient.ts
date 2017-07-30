import './fetch';

import * as _ from 'lodash';
import { DocumentNode, GraphQLError } from 'graphql';

import { getOperationName, isGQLientArgs, transformQuery } from './utils';
import { GraphQLRequest, GraphQLResponse, GQLientArgs } from './interfaces';

export default class GQLient {
  constructor(private endpoint: string, private options: RequestInit = {}) {
    this.endpoint = endpoint;
    this.options = options;
  }

  async execute(
    query: DocumentNode | GQLientArgs | string,
    variables?: Object,
  ): Promise<GraphQLResponse> {
    if (isGQLientArgs(query)) {
      variables = query.variables;
      if (query.query) {
        query = query.query;
      } else if (query.mutation) {
        query = query.mutation;
      } else {
        throw new Error('You must provide either a query or mutation string/document');
      }
    }
    const request: GraphQLRequest = {
      query: transformQuery(query),
      variables,
      operationName: getOperationName(query),
    };

    const { headers, ...otherOptions } = this.options;
    const response = await fetch(this.endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(request),
      ...otherOptions,
    });

    const result = { ...await response.json(), status: response.status };

    if (response.ok && !result.errors && result.data) {
      return result.data;
    } else {
      throw new GQLientError({ ...result, status: response.status }, request);
    }
  }

  query = this.execute;
  mutate = this.execute;
}

class GQLientError extends GraphQLError {
  private response: GraphQLResponse;
  private request: GraphQLRequest;

  constructor(response: GraphQLResponse, request: GraphQLRequest) {
    const message = `${GQLientError.extractMessage(response)}: ${JSON.stringify({
      response,
      request,
    })}`;

    super(message);

    this.response = response;
    this.request = request;

    (Error as any).captureStackTrace(this, GQLientError);
  }

  static extractMessage(response: GraphQLResponse): string {
    return _.get(
      response,
      'errors.0.message',
      `GraphQL Error (Code: ${response.status})`,
    );
  }
}
