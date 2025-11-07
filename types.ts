
export enum Genre {
  FunnyClips = 'Funny Clips',
  FunnyAnimals = 'Funny Animal Shorts',
  HorrorComedy = 'Horror Comedy',
  AnimalsInCCTV = 'Animals in CCTV',
  FunnyFails = 'Funny Fails',
  PrankVideos = 'Prank Videos',
  Paranormal = 'Paranormal',
  CreepyShorts = 'Creepy Shorts',
  Crime = 'Crime',
  UnsolvedMystery = 'Unsolved Mystery',
  HistoryTrivia = 'Engaging History Trivia',
  GhostStories = 'Real and Folklore Ghost Stories',
  EngagingShortStory = 'Engaging Short Story',
  DogCalmingVideos = 'Dog Calming Videos',
  CatCalmingVideos = 'Cat Calming Videos',
  Roblox = 'Roblox',
  Minecraft = 'Minecraft',
  Gaming = 'Gaming',
  ASMR = 'ASMR',
  SoothingMusic = 'Soothing Music',
  History = 'History',
  CrimeFiles = 'Crime Files',
  DIY = 'DIY',
  SelfCare = 'Self Care',
  LofiShorts = 'Lo-fi Shorts',
  AdorablePets = 'Adorable Pets',
  UGCAds = 'UGC Ads',
  ProductAd = 'Product Ad',
}

export enum Duration {
  Shorts8to10 = '8-10 seconds',
  Shorts15 = '15 seconds',
  Shorts30 = '30 seconds',
  Shorts60 = '1 minute',
  Long = '2-5 minutes',
}

export interface Idea {
  id?: string;
  title: string;
  concept: string;
  storyArc: string;
  visualsAndAudio: string;
  tags: string[];
  genre: Genre;
  duration: Duration;
}

export type SavedIdeasFilter = Genre | 'all' | 'trending';

export interface SeoContent {
  title: string;
  description: string;
  tags: string[];
}

export interface ScriptHistoryItem {
  id: string;
  idea: Idea;
  jsonScript: string;
  seoContent: SeoContent;
}
