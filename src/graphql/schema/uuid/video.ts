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
import { Schema } from '../utils'
import {
  EntityPayload,
  EntityType,
  EntityRevision,
  EntityRevisionPayload,
  EntityRevisionType,
} from './abstract-entity'
import {
  addTaxonomyTermChildResolvers,
  TaxonomyTermChild,
} from './abstract-taxonomy-term-child'

export const videoSchema = new Schema()

export class Video extends TaxonomyTermChild {
  public __typename = EntityType.Video
}
export interface VideoPayload extends EntityPayload {
  taxonomyTermIds: number[]
}

export class VideoRevision extends EntityRevision {
  public __typename = EntityRevisionType.VideoRevision
  public url: string
  public title: string
  public content: string
  public changes: string

  public constructor(payload: VideoRevisionPayload) {
    super(payload)
    this.url = payload.url
    this.title = payload.title
    this.content = payload.content
    this.changes = payload.changes
  }
}

export interface VideoRevisionPayload extends EntityRevisionPayload {
  url: string
  title: string
  content: string
  changes: string
}

addTaxonomyTermChildResolvers({
  schema: videoSchema,
  entityType: EntityType.Video,
  entityRevisionType: EntityRevisionType.VideoRevision,
  repository: 'video',
  Entity: Video,
  EntityRevision: VideoRevision,
  entityFields: `
    taxonomyTerms: [TaxonomyTerm!]!
  `,
  entityRevisionFields: `
    url: String!
    title: String!
    content: String!
    changes: String!
  `,
})
