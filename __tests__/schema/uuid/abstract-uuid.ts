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
import { gql } from 'apollo-server'
import { rest } from 'msw'
import * as R from 'ramda'

import {
  applet,
  appletRevision,
  article,
  articleRevision,
  course,
  coursePage,
  coursePageRevision,
  courseRevision,
  event,
  eventRevision,
  exercise,
  exerciseGroup,
  exerciseGroupRevision,
  exerciseRevision,
  getArticleDataWithoutSubResolvers,
  groupedExercise,
  groupedExerciseRevision,
  page,
  pageRevision,
  solution,
  solutionRevision,
  taxonomyTermRoot,
  user,
  user2,
  video,
  videoRevision,
} from '../../../__fixtures__'
import {
  assertFailingGraphQLMutation,
  assertFailingGraphQLQuery,
  assertSuccessfulGraphQLMutation,
  assertSuccessfulGraphQLQuery,
  Client,
  createJsonHandler,
  createTestClient,
  createUuidHandler,
  getDatabaseLayerUrl,
} from '../../__utils__'
import {
  DiscriminatorType,
  EntityRevisionType,
  EntityType,
  UuidPayload,
  UuidType,
} from '~/schema/uuid'
import { Instance } from '~/types'

let client: Client

beforeEach(() => {
  client = createTestClient()
})

const abstractUuidFixtures: Record<
  // Endpoint uuid() returns null for comments
  Exclude<UuidType, DiscriminatorType.Comment>,
  UuidPayload
> = {
  [DiscriminatorType.Page]: page,
  [DiscriminatorType.PageRevision]: pageRevision,
  [DiscriminatorType.TaxonomyTerm]: taxonomyTermRoot,
  [DiscriminatorType.User]: user,
  [EntityType.Applet]: applet,
  [EntityType.Article]: article,
  [EntityType.Course]: course,
  [EntityType.CoursePage]: coursePage,
  [EntityType.Exercise]: exercise,
  [EntityType.ExerciseGroup]: exerciseGroup,
  [EntityType.Event]: event,
  [EntityType.GroupedExercise]: groupedExercise,
  [EntityType.Solution]: solution,
  [EntityType.Video]: video,
  [EntityRevisionType.AppletRevision]: appletRevision,
  [EntityRevisionType.ArticleRevision]: articleRevision,
  [EntityRevisionType.CourseRevision]: courseRevision,
  [EntityRevisionType.CoursePageRevision]: coursePageRevision,
  [EntityRevisionType.ExerciseRevision]: exerciseRevision,
  [EntityRevisionType.ExerciseGroupRevision]: exerciseGroupRevision,
  [EntityRevisionType.EventRevision]: eventRevision,
  [EntityRevisionType.GroupedExerciseRevision]: groupedExerciseRevision,
  [EntityRevisionType.SolutionRevision]: solutionRevision,
  [EntityRevisionType.VideoRevision]: videoRevision,
}
const abstractUuidRepository = R.toPairs(abstractUuidFixtures)

describe('uuid', () => {
  test('returns null when alias cannot be found', async () => {
    global.server.use(
      createJsonHandler({
        path: '/alias/de/not-existing',
        body: null,
      })
    )

    await assertSuccessfulGraphQLQuery({
      query: gql`
        query notExistingUuid($alias: AliasInput) {
          uuid(alias: $alias) {
            __typename
          }
        }
      `,
      variables: { alias: { instance: 'de', path: '/not-existing' } },
      data: { uuid: null },
      client,
    })
  })

  test('returns uuid when alias is /entity/view/:id', async () => {
    global.server.use(createUuidHandler(article))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query uuid($alias: AliasInput!) {
          uuid(alias: $alias) {
            __typename
            ... on Article {
              id
              trashed
              instance
              date
            }
          }
        }
      `,
      variables: {
        alias: {
          instance: Instance.De,
          path: `/entity/view/${article.id}`,
        },
      },
      data: {
        uuid: getArticleDataWithoutSubResolvers(article),
      },
      client,
    })
  })

  test('returns revision when alias is /entity/repository/compare/:entityId/:revisionId', async () => {
    global.server.use(createUuidHandler(articleRevision))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query uuid($alias: AliasInput!) {
          uuid(alias: $alias) {
            id
          }
        }
      `,
      variables: {
        alias: {
          instance: Instance.De,
          path: `/entity/repository/compare/${article.id}/${articleRevision.id}`,
        },
      },
      data: { uuid: { id: articleRevision.id } },
      client,
    })
  })

  test('returns null when uuid does not exist', async () => {
    global.server.use(createJsonHandler({ path: '/uuid/666', body: null }))

    await assertSuccessfulGraphQLQuery({
      query: gql`
        query requestNonExistingUuid($id: Int!) {
          uuid(id: $id) {
            __typename
          }
        }
      `,
      variables: { id: 666 },
      data: {
        uuid: null,
      },
      client,
    })
  })

  test('returns an error when no arguments are given', async () => {
    await assertFailingGraphQLQuery({
      query: gql`
        query emptyUuidRequest {
          uuid {
            __typename
          }
        }
      `,
      message: 'you need to provide an id or an alias',
      client,
    })
  })

  test("returns an error when the path does not start with '/'", async () => {
    await assertFailingGraphQLQuery({
      query: gql`
        query emptyUuidRequest {
          uuid(alias: { instance: de, path: "mathe" }) {
            __typename
          }
        }
      `,
      message:
        "First is the worst, please add a '/' at the beginning of your path",
      client,
    })
  })

  test('returns an error when request fails (500)', async () => {
    // TODO: this should be a helper
    global.server.use(
      rest.get(
        getDatabaseLayerUrl({ path: `/uuid/${user.id}` }),
        (_req, res, ctx) => {
          return res(ctx.status(500), ctx.json(null))
        }
      )
    )

    await assertFailingGraphQLQuery({
      query: gql`
        query user($id: Int!) {
          uuid(id: $id) {
            __typename
          }
        }
      `,
      variables: user,
      message: '500: Internal Server Error',
      client,
    })
  })

  test('succeeds on 404', async () => {
    global.server.use(
      rest.get(
        getDatabaseLayerUrl({ path: `/uuid/${user.id}` }),
        (_req, res, ctx) => {
          return res(ctx.status(404), ctx.json(null))
        }
      )
    )

    await assertSuccessfulGraphQLQuery({
      query: gql`
        query user($id: Int!) {
          uuid(id: $id) {
            __typename
          }
        }
      `,
      variables: user,
      data: {
        uuid: null,
      },
      client,
    })
  })
})

describe('uuid mutation setState', () => {
  const mutation = gql`
    mutation uuid($input: UuidSetStateInput!) {
      uuid {
        setState(input: $input) {
          success
        }
      }
    }
  `

  beforeEach(() => {
    global.server.use(
      rest.post<{
        ids: number[]
        userId: number
        trashed: boolean
      }>(getDatabaseLayerUrl({ path: '/set-uuid-state' }), (req, res, ctx) => {
        const { userId } = req.body

        if (userId !== user.id) return res(ctx.status(403))

        return res(ctx.status(200))
      })
    )
  })

  test('authenticated with array of ids', async () => {
    await assertSuccessfulGraphQLMutation({
      mutation,
      variables: {
        input: { id: [1, 2, 3], trashed: true },
      },
      data: { uuid: { setState: { success: true } } },
      client: createTestClient({ userId: user.id }),
    })
  })

  test('unauthenticated', async () => {
    await assertFailingGraphQLMutation({
      mutation,
      variables: { input: { id: 1, trashed: true } },
      client: createTestClient({ userId: null }),
      expectedError: 'UNAUTHENTICATED',
    })
  })

  test('wrong user id', async () => {
    await assertFailingGraphQLMutation({
      mutation,
      variables: { input: { id: 1, trashed: false } },
      client: createTestClient({ userId: user2.id }),
      expectedError: 'FORBIDDEN',
    })
  })
})

describe('property "alias"', () => {
  describe('returns encoded alias when alias of payloads is a string', () => {
    test.each(abstractUuidRepository)('type = %s', async (_type, payload) => {
      global.server.use(
        createUuidHandler({ ...payload, alias: '/%%/größe', id: 23 })
      )

      await assertSuccessfulGraphQLQuery({
        query: gql`
          query($id: Int) {
            uuid(id: $id) {
              alias
            }
          }
        `,
        variables: { id: 23 },
        data: { uuid: { alias: '/%25%25/gr%C3%B6%C3%9Fe' } },
        client,
      })
    })
  })
})

describe('custom aliases', () => {
  test('de.serlo.org/mathe resolves to uuid 19767', async () => {
    global.server.use(
      createJsonHandler({
        path: `/uuid/19767`,
        body: {
          ...page,
          id: 19767,
          alias: '/legacy-alias',
        },
      })
    )
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query uuid($alias: AliasInput!) {
          uuid(alias: $alias) {
            id
            ... on Page {
              alias
            }
          }
        }
      `,
      variables: {
        alias: { instance: Instance.De, path: '/mathe' },
      },
      data: {
        uuid: { id: 19767, alias: '/mathe' },
      },
      client,
    })
  })
})
