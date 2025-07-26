import { Doc, Id } from "../../../convex/_generated/dataModel";

export interface ChannelDetails {
  title: string;
  thumbnail: string;
  subscribers: string;
}

export interface VideoDetails {
  title: string;
  description: string;
  thumbnail: string;
}

export interface TranscriptEntry {
  text: string;
  timestamp: string;
}

// export interface Video {
//   _id: Id<"videos">;
//   _creationTime: number;
//   videoId: string;
//   userId: string;
//   title: string;
// }

