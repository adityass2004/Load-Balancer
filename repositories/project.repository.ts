import { Prisma } from '@/src/generated/prisma';
import { db } from '@/lib/db';
import { DatabaseError, NotFoundError } from '@/lib/errors';
import type { CreateProjectInput, UpdateProjectInput } from '@/lib/validations';
import type {
  IRepository,
  ProjectFilters,
  ProjectQueryParams,
  ProjectSortField,
  PaginationParams,
  SortOrder,
} from '@/types/repository';
import type { Project } from '@/types/domain';

class ProjectRepository implements IRepository<Project, CreateProjectInput, UpdateProjectInput, ProjectFilters> {
  async findById(id: string): Promise<Project | null> {
    try {
      return await db.project.findUnique({ where: { id } });
    } catch (e) {
      throw new DatabaseError(`findById failed: ${(e as Error).message}`);
    }
  }

  async findByIdOrThrow(id: string): Promise<Project> {
    const project = await this.findById(id);
    if (!project) throw new NotFoundError('Project', id);
    return project;
  }

  async findBySlug(slug: string): Promise<Project | null> {
    try {
      return await db.project.findUnique({ where: { slug } });
    } catch (e) {
      throw new DatabaseError(`findBySlug failed: ${(e as Error).message}`);
    }
  }

  async findMany(
    filters: ProjectFilters = {},
    pagination: PaginationParams = {}
  ): Promise<Project[]> {
    const { page = 1, pageSize = 20 } = pagination;
    const where = buildProjectWhere(filters);

    try {
      return await db.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } catch (e) {
      throw new DatabaseError(`findMany failed: ${(e as Error).message}`);
    }
  }

  async findManyWithQuery(params: ProjectQueryParams): Promise<Project[]> {
    const {
      page = 1,
      pageSize = 20,
      sortField = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = params;

    const where = buildProjectWhere(filters);
    const orderBy = buildProjectOrderBy(sortField, sortOrder);

    try {
      return await db.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } catch (e) {
      throw new DatabaseError(`findManyWithQuery failed: ${(e as Error).message}`);
    }
  }

  async create(data: CreateProjectInput): Promise<Project> {
    try {
      return await db.project.create({ data });
    } catch (e) {
      throw new DatabaseError(`create failed: ${(e as Error).message}`);
    }
  }

  async update(id: string, data: UpdateProjectInput): Promise<Project> {
    try {
      return await db.project.update({ where: { id }, data });
    } catch (e) {
      throw new DatabaseError(`update failed: ${(e as Error).message}`);
    }
  }

  async setEnabled(id: string, enabled: boolean): Promise<Project> {
    try {
      return await db.project.update({ where: { id }, data: { enabled } });
    } catch (e) {
      throw new DatabaseError(`setEnabled failed: ${(e as Error).message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.project.delete({ where: { id } });
    } catch (e) {
      throw new DatabaseError(`delete failed: ${(e as Error).message}`);
    }
  }

  async count(filters: ProjectFilters = {}): Promise<number> {
    try {
      return await db.project.count({ where: buildProjectWhere(filters) });
    } catch (e) {
      throw new DatabaseError(`count failed: ${(e as Error).message}`);
    }
  }
}

function buildProjectWhere(filters: ProjectFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};

  if (filters.enabled !== undefined) where.enabled = filters.enabled;

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

function buildProjectOrderBy(
  field: ProjectSortField,
  order: SortOrder
): Prisma.ProjectOrderByWithRelationInput[] {
  if (field === 'createdAt') return [{ createdAt: order }];
  return [{ [field]: order }, { createdAt: 'desc' }];
}

export const projectRepository = new ProjectRepository();
