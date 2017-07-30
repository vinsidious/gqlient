import * as _ from 'lodash';
import gql from 'graphql-tag';
import { DocumentNode, OperationDefinitionNode, SelectionSetNode } from 'graphql';
import { print } from 'graphql/language/printer';

import { GQLientArgs } from './interfaces';

export function transformQuery(doc: DocumentNode | string): string {
  if (!isGraphQLDocument(doc)) doc = gql(doc) as DocumentNode;
  return print(addTypenameToDocument(doc));
}

export function addTypenameToDocument(doc: DocumentNode | string): DocumentNode {
  if (!isGraphQLDocument(doc)) doc = gql(doc) as DocumentNode;
  const _document = _.cloneDeep(doc);
  _.forEach(_document.definitions, definition => {
    const isRoot = definition.kind === 'OperationDefinition';
    addTypenameToSelectionSet(
      (definition as OperationDefinitionNode).selectionSet,
      isRoot,
    );
  });
  return _document;
}

export function getOperationName(doc: DocumentNode | string): string | undefined {
  if (!isGraphQLDocument(doc)) doc = gql(doc) as DocumentNode;
  let res: string | undefined = undefined;
  doc.definitions.forEach(definition => {
    if (definition.kind === 'OperationDefinition' && definition.name) {
      res = definition.name.value;
    }
  });
  return res;
}

export function isGraphQLDocument(doc: any): doc is DocumentNode {
  return doc && doc.kind === 'Document';
}

export function isGQLientArgs(obj: any): obj is GQLientArgs {
  return obj && ('query' in obj || 'mutation' in obj);
}

function addTypenameToSelectionSet(
  selectionSet: SelectionSetNode,
  isRoot: boolean = false,
) {
  if (_.isNil(isRoot)) isRoot = false;
  if (selectionSet.selections) {
    if (!isRoot) {
      const alreadyHasThisField = _.some(selectionSet.selections, selection => {
        return selection.kind === 'Field' && selection.name.value === '__typename';
      });
      if (!alreadyHasThisField) {
        selectionSet.selections.push({
          kind: 'Field',
          name: {
            kind: 'Name',
            value: '__typename',
          },
        });
      }
    }
    _.forEach(selectionSet.selections, selection => {
      if (selection.kind === 'Field') {
        if (selection.name.value.lastIndexOf('__', 0) !== 0 && selection.selectionSet) {
          addTypenameToSelectionSet(selection.selectionSet);
        }
      } else if (selection.kind === 'InlineFragment') {
        if (selection.selectionSet) {
          addTypenameToSelectionSet(selection.selectionSet);
        }
      }
    });
  }
  return selectionSet;
}
