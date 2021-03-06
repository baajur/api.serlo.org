/**
 * This file is part of Serlo.org API
 *
 * Copyright (c) 2020-2021 Serlo Education e.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @copyright Copyright (c) 2020-2021 Serlo Education e.V.
 * @license   http://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/serlo-org/api.serlo.org for the canonical source repository
 */
import {
  EntityPayload,
  EntityRevisionPayload,
  EntityRevisionType,
  EntityType,
} from '../abstract-entity'
import { PagePayload, PageRevisionPayload } from '../page'
import { TaxonomyTermPayload } from '../taxonomy-term'
import { UserPayload } from '../user'
import {
  MutationNamespace,
  MutationResolver,
  QueryResolver,
  Resolver,
  TypeResolver,
} from '~/internals/graphql'
import { CommentPayload } from '~/schema/thread/types'
import {
  AbstractUuid,
  UuidMutationSetStateArgs,
  QueryUuidArgs,
  UuidSetStateResponse,
} from '~/types'

export enum DiscriminatorType {
  Page = 'Page',
  PageRevision = 'PageRevision',
  User = 'User',
  TaxonomyTerm = 'TaxonomyTerm',
  Comment = 'Comment',
}

export type UuidType = DiscriminatorType | EntityType | EntityRevisionType

export type UuidPayload =
  | EntityPayload
  | EntityRevisionPayload
  | PagePayload
  | PageRevisionPayload
  | UserPayload
  | TaxonomyTermPayload
  | CommentPayload
export interface AbstractUuidPayload
  extends Omit<AbstractUuid, keyof UuidResolvers> {
  __typename: UuidType
  alias: string | null
}

export interface UuidResolvers {
  alias: Resolver<AbstractUuidPayload, never, string | null>
}

export interface AbstractUuidResolvers {
  AbstractUuid: {
    __resolveType: TypeResolver<UuidPayload>
  }
  Query: {
    uuid: QueryResolver<QueryUuidArgs, UuidPayload | null>
  }
  Mutation: {
    uuid: MutationNamespace
  }
  UuidMutation: {
    setState: MutationResolver<UuidMutationSetStateArgs, UuidSetStateResponse>
  }
}
