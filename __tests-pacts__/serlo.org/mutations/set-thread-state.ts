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

import { comment, user } from '../../../__fixtures__'
import { createTestClient } from '../../../__tests__/__utils__'
import {
  addMutationInteraction,
  assertSuccessfulGraphQLMutation,
} from '../../__utils__'

test('set-thread-state', async () => {
  global.client = createTestClient({ userId: user.id })
  await addMutationInteraction({
    name: 'set state of thread with id of first comment 100',
    given: `there exists a thread with a first comment with id 100 and user with id ${user.id} is authenticated`,
    path: '/api/set-uuid-state',
    requestBody: {
      id: comment.id,
      userId: user.id,
      trashed: true,
    },
    responseBody: {
      id: 1000,
      title: 'First comment in new thread',
      trashed: false,
      alias: null,
      __typename: 'Comment',
      authorId: user.id,
      date: 'Datestring',
      archived: false,
      content: 'first!',
      parentId: 1565,
      childrenIds: [],
    },
  })
  await assertSuccessfulGraphQLMutation({
    mutation: gql`
      mutation createThread($input: ThreadCreateThreadInput!) {
        thread {
          createThread(input: $input) {
            success
            record {
              archived
              comments {
                nodes {
                  content
                  title
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        title: 'First comment in new thread',
        content: 'first!',
        objectId: 1565,
      },
    },
    data: {
      thread: {
        createThread: {
          success: true,
          record: {
            archived: false,
            comments: {
              nodes: [
                {
                  content: 'first!',
                  title: 'First comment in new thread',
                },
              ],
            },
          },
        },
      },
    },
  })

  // uuid cache is probably invalidated, should we check that here?
  // scrap that – we probably want to mutate the cache instead anyway :)

  // await assertSuccessfulGraphQLQuery({
  //   query: gql`
  //     query {
  //       notifications {
  //         nodes {
  //           id
  //           unread
  //         }
  //         totalCount
  //       }
  //     }
  //   `,
  //   data: {
  //     notifications: { nodes: [{ id: 9, unread: true }], totalCount: 1 },
  //   },
  // })
})
