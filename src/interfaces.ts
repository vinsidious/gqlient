import { ExecutionResult, DocumentNode } from 'graphql';

export interface GraphQLResponse extends ExecutionResult {
  status: number;
  [key: string]: any;
}

export interface GraphQLRequest {
  query: string;
  variables?: Object;
  operationName?: string;
}

export interface GQLientArgs {
  query?: DocumentNode | string;
  mutation?: DocumentNode | string;
  variables?: Object;
}
