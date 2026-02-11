export interface IApiPagination<T> {
  currentPage: number;
  pageSize: number;
  totalData: number;
  totalPage: number;
  list: T;
}

export interface Content {
  id: string;
  name: string;
  phoneNumber: string;
  outletName: string;
  marketingName: string;
  status: string;
}

export interface ISort {
  empty: boolean;
  isorted: boolean;
  unisorted: boolean;
}

export interface IPageable {
  isort: ISort;
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

export interface ISort2 {
  empty: boolean;
  isorted: boolean;
  unisorted: boolean;
}

interface IResults<T> {
  content: T;
  pageable: IPageable | undefined;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  isort: ISort2;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface IApiResponse<T> {
  code: number;
  error: boolean;
  message: string;
  results: IResults<T> | T;
}

export interface IApiResponsePagination<T> {
  message: string;
  result: IApiPagination<T>;
}

export interface IResultResponseError {
  field: string;
  message: string;
}

export interface IApiResponseError {
  message: string;
  error: boolean;
  code: number;
  results?: IResultResponseError[];
}

export interface IApiResponseBase {
  ok: boolean;
  config: any;
  message: string;
  headers: any;
  errorStatus?: number;
  status?: number;
  result: any;
  error?: object;
}
