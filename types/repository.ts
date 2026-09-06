// Generic filter/pagination types used across all repositories

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type SortOrder = 'asc' | 'desc';

export type SortParams<T extends string = string> = {
  field: T;
  order: SortOrder;
};

// All sortable fields on the Server model
export type ServerSortField =
  | 'name'
  | 'url'
  | 'priority'
  | 'weight'
  | 'createdAt'
  | 'updatedAt'
  | 'requestsHandled'
  | 'averageResponseTime';

export type ServerFilters = {
  projectId?: string;
  enabled?: boolean;
  healthy?: import('@/src/generated/prisma').ServerHealth;
  search?: string;
  includeDeleted?: boolean;
};

// Full query params used by getAll — combines filters + pagination + sort
export type ServerQueryParams = ServerFilters & PaginationParams & {
  sortField?: ServerSortField;
  sortOrder?: SortOrder;
};

export type SettingsFilters = Record<string, never>;

// All sortable fields on the Project model
export type ProjectSortField = 'name' | 'slug' | 'createdAt' | 'updatedAt';

export type ProjectFilters = {
  enabled?: boolean;
  search?: string;
};

export type ProjectQueryParams = ProjectFilters & PaginationParams & {
  sortField?: ProjectSortField;
  sortOrder?: SortOrder;
};

// Generic repository interface — all repositories implement this shape
export interface IRepository<TModel, TCreate, TUpdate, TFilters = Record<string, unknown>> {
  findById(id: string): Promise<TModel | null>;
  findMany(filters?: TFilters, pagination?: PaginationParams): Promise<TModel[]>;
  create(data: TCreate): Promise<TModel>;
  update(id: string, data: TUpdate): Promise<TModel>;
  delete(id: string): Promise<void>;
  count(filters?: TFilters): Promise<number>;
}
