export enum ProcessingState {
  IDLE,
  PAGE_SELECTION,
  PROCESSING,
  DONE,
  ERROR,
}

export interface ProgressUpdate {
  page: number;
  total: number;
  message: string;
}
