/**
 * This file is part of Serlo.org API
 *
 * Copyright (c) 2020 Serlo Education e.V.
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
 * @copyright Copyright (c) 2020 Serlo Education e.V.
 * @license   http://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/serlo-org/api.serlo.org for the canonical source repository
 */
import { ForbiddenError } from 'apollo-server'

import { Service } from '../../types'
import { UserResolvers, isUserPayload } from './types'

export const resolvers: UserResolvers = {
  Query: {
    async activeDonors(_parent, _args, { dataSources }) {
      const ids = await dataSources.activeDonorSheet.getActiveDonorIds()

      const uuids = await Promise.all(
        ids.map((id) => dataSources.serlo.getUuid({ id }))
      )

      // TODO: Report uuids which are not users to sentry
      return uuids.filter(isUserPayload)
    },
  },
  Mutation: {
    async _setUser(_parent, payload, { dataSources, service }) {
      if (service !== Service.Serlo) {
        throw new ForbiddenError(
          'You do not have the permissions to set an user'
        )
      }
      await dataSources.serlo.setUser(payload)
    },
  },
}
