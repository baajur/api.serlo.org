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

import {
  exerciseGroup,
  exerciseGroupRevision,
  getExerciseGroupDataWithoutSubResolvers,
  getExerciseGroupRevisionDataWithoutSubResolvers,
  getGroupedExerciseDataWithoutSubResolvers,
  groupedExercise,
} from '../../../__fixtures__'
import {
  assertSuccessfulGraphQLQuery,
  Client,
  createTestClient,
  createUuidHandler,
} from '../../__utils__'

let client: Client

beforeEach(() => {
  client = createTestClient()
})

describe('ExerciseGroup', () => {
  beforeEach(() => {
    global.server.use(createUuidHandler(exerciseGroup))
  })

  test('by id', async () => {
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query exerciseGroup($id: Int!) {
          uuid(id: $id) {
            __typename
            ... on ExerciseGroup {
              id
              trashed
              instance
              date
            }
          }
        }
      `,
      variables: exerciseGroup,
      data: {
        uuid: getExerciseGroupDataWithoutSubResolvers(exerciseGroup),
      },
      client,
    })
  })

  test('by id (w/ exercises)', async () => {
    global.server.use(createUuidHandler(groupedExercise))
    await assertSuccessfulGraphQLQuery({
      query: gql`
        query exerciseGroup($id: Int!) {
          uuid(id: $id) {
            ... on ExerciseGroup {
              exercises {
                __typename
                id
                trashed
                instance
                date
              }
            }
          }
        }
      `,
      variables: exerciseGroup,
      data: {
        uuid: {
          exercises: [
            getGroupedExerciseDataWithoutSubResolvers(groupedExercise),
          ],
        },
      },
      client,
    })
  })
})

test('ExerciseGroupRevision', async () => {
  global.server.use(createUuidHandler(exerciseGroupRevision))
  await assertSuccessfulGraphQLQuery({
    query: gql`
      query exerciseGroupRevision($id: Int!) {
        uuid(id: $id) {
          __typename
          ... on ExerciseGroupRevision {
            id
            trashed
            date
            content
            changes
          }
        }
      }
    `,
    variables: exerciseGroupRevision,
    data: {
      uuid: getExerciseGroupRevisionDataWithoutSubResolvers(
        exerciseGroupRevision
      ),
    },
    client,
  })
})
