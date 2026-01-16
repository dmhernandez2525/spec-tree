interface Timestamps {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}
interface ApiResponse<T> {
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}
interface SingleApiResponse<T> {
  data: T;
  meta: {};
}
interface ImageAttributes extends Timestamps {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;

  // TOOD-p2: add theses types to image
  //  formats.small.url
}
interface Image {
  id: number;
  attributes: ImageAttributes;
}
interface AppAttributes extends Timestamps {
  id: number;
  applicationInformation: string;
}
interface AppData {
  id: number;
  attributes: AppAttributes;
}
interface ApiSettings {
  startHour: string;
  endHour: string;
}

export type {
  ApiSettings,
  Timestamps,
  PaginationMeta,
  ApiResponse,
  SingleApiResponse,
  ImageAttributes,
  Image,
  AppAttributes,
  AppData,
};
