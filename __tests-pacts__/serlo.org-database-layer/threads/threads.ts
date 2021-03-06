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
import { Matchers } from '@pact-foundation/pact'
import fetch from 'node-fetch'

import { article, comment } from '../../../__fixtures__'
import { addJsonInteraction, addUuidInteraction } from '../../__utils__'
import { CommentPayload } from '~/schema/thread'

test('Threads', async () => {
  // This is a noop test that just adds the interaction to the contract
  await addJsonInteraction({
    name: `fetch first comment ids of all threads for an article}`,
    given: `article ${article.id} has threads`,
    path: `/threads/${article.id}`,
    body: {
      firstCommentIds: Matchers.eachLike(Matchers.integer(1)),
    },
  })
  await fetch(
    `http://${process.env.SERLO_ORG_DATABASE_LAYER_HOST}/threads/${article.id}`
  )
})

test('Comment', async () => {
  // This is a noop test that just adds the interaction to the contract
  await addUuidInteraction<CommentPayload>({
    __typename: comment.__typename,
    id: comment.id,
    trashed: Matchers.boolean(comment.trashed),
    alias: comment.alias,
    authorId: Matchers.integer(comment.authorId),
    title: comment.title ? Matchers.string(comment.title) : null,
    date: Matchers.iso8601DateTime(comment.date),
    archived: Matchers.boolean(comment.archived),
    content: Matchers.string(comment.content),
    parentId: Matchers.integer(comment.parentId),
    childrenIds: comment.childrenIds,
  })
  await fetch(
    `http://${process.env.SERLO_ORG_DATABASE_LAYER_HOST}/uuid/${comment.id}`
  )
})
