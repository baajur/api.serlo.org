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

import { Connection } from '../../connection'
import {
  AbstractUuidPayload,
  DiscriminatorType,
  UuidResolvers,
} from '../abstract-uuid'
import { QueryResolver, Resolver } from '~/internals/graphql'
import { ThreadAwareResolvers } from '~/schema/thread'
import {
  QueryActiveAuthorsArgs,
  QueryActiveDonorsArgs,
  QueryActiveReviewersArgs,
  User,
} from '~/types'

export interface UserPayload extends Omit<User, keyof UserResolvers['User']> {
  __typename: DiscriminatorType.User
  alias: string
}

export interface UserResolvers {
  Query: {
    activeAuthors: QueryResolver<
      QueryActiveAuthorsArgs,
      Connection<UserPayload>
    >
    activeDonors: QueryResolver<QueryActiveDonorsArgs, Connection<UserPayload>>
    activeReviewers: QueryResolver<
      QueryActiveReviewersArgs,
      Connection<UserPayload>
    >
  }
  User: {
    activeAuthor: Resolver<UserPayload, never, boolean>
    activeDonor: Resolver<UserPayload, never, boolean>
    activeReviewer: Resolver<UserPayload, never, boolean>
  } & UuidResolvers &
    ThreadAwareResolvers
}

export function isUserPayload(
  payload: AbstractUuidPayload | null
): payload is UserPayload {
  return payload !== null && payload.__typename === DiscriminatorType.User
}
