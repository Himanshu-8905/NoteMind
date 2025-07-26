/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as documents from "../documents.js";
import type * as documentsChunks from "../documentsChunks.js";
import type * as messages from "../messages.js";
import type * as note from "../note.js";
import type * as project from "../project.js";
import type * as sourceCodeEmbedding from "../sourceCodeEmbedding.js";
import type * as storage from "../storage.js";
import type * as video from "../video.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  documentsChunks: typeof documentsChunks;
  messages: typeof messages;
  note: typeof note;
  project: typeof project;
  sourceCodeEmbedding: typeof sourceCodeEmbedding;
  storage: typeof storage;
  video: typeof video;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
