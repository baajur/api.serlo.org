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
import { gql } from 'apollo-server'
import * as R from 'ramda'

import {
  checkoutRevisionNotificationEvent,
  rejectRevisionNotificationEvent,
  createCommentNotificationEvent,
  createEntityNotificationEvent,
  createEntityLinkNotificationEvent,
  removeEntityLinkNotificationEvent,
  setLicenseNotificationEvent,
  setUuidStateNotificationEvent,
  createThreadNotificationEvent,
  createTaxonomyLinkNotificationEvent,
  createEntityRevisionNotificationEvent,
  removeTaxonomyLinkNotificationEvent,
  createTaxonomyTermNotificationEvent,
  setTaxonomyTermNotificationEvent,
  setThreadStateNotificationEvent,
  user,
} from '../../__fixtures__'
import {
  NotificationEventType,
  NotificationEventPayload,
} from '../../src/graphql/schema'
import { Service } from '../../src/graphql/schema/types'
import {
  Client,
  createTestClient,
  assertSuccessfulGraphQLQuery,
  createApiHandler,
} from '../__utils__'

let client: Client

beforeEach(() => {
  client = createTestClient({
    service: Service.SerloCloudflareWorker,
    user: user.id,
  }).client
})

const eventRepository: Record<
  NotificationEventType,
  NotificationEventPayload
> = {
  [NotificationEventType.CheckoutRevision]: checkoutRevisionNotificationEvent,
  [NotificationEventType.RejectRevision]: rejectRevisionNotificationEvent,
  [NotificationEventType.CreateComment]: createCommentNotificationEvent,
  [NotificationEventType.SetLicense]: setLicenseNotificationEvent,
  [NotificationEventType.CreateEntity]: createEntityNotificationEvent,
  [NotificationEventType.CreateTaxonomyLink]: createTaxonomyLinkNotificationEvent,
  [NotificationEventType.RemoveTaxonomyLink]: removeTaxonomyLinkNotificationEvent,
  [NotificationEventType.CreateThread]: createThreadNotificationEvent,
  [NotificationEventType.SetUuidState]: setUuidStateNotificationEvent,
  [NotificationEventType.CreateEntityLink]: createEntityLinkNotificationEvent,
  [NotificationEventType.RemoveEntityLink]: removeEntityLinkNotificationEvent,
  [NotificationEventType.CreateEntityRevision]: createEntityRevisionNotificationEvent,
  [NotificationEventType.CreateTaxonomyTerm]: createTaxonomyTermNotificationEvent,
  [NotificationEventType.SetTaxonomyTerm]: setTaxonomyTermNotificationEvent,
  [NotificationEventType.SetTaxonomyParent]: setTaxonomyTermNotificationEvent,
  [NotificationEventType.SetThreadState]: setThreadStateNotificationEvent,
}
const events = R.values(eventRepository).map((event, id) => {
  return { ...event, id }
})

test('without filter', async () => {
  setupEvents({ events, maxReturn: 5 })

  await assertSuccessfulGraphQLQuery({
    query: gql`
      query events {
        events {
          nodes {
            __typename
            id
          }
        }
      }
    `,
    client,
    data: { events: { nodes: events.map(getTypenameAndId) } },
  })
})

function setupEvents({
  events,
  maxReturn,
}: {
  events: NotificationEventPayload[]
  maxReturn: number
}) {
  global.server.use(
    createApiHandler({
      path: '/api/events',
      resolver(req, res, ctx) {
        const after = req.url.searchParams.get('after')

        if (after === null) {
          return res(ctx.json({ nodes: events.slice(0, maxReturn) }))
        }

        const index = events.findIndex((e) => e.id === parseInt(after))

        if (index < 0) return res(ctx.status(400))

        const nodes = events.slice(index + 1, index + 1 + maxReturn)

        return res(ctx.json({ nodes }))
      },
    })
  )
}

function getTypenameAndId(event: NotificationEventPayload) {
  return R.pick(['__typename', 'id'], event)
}
