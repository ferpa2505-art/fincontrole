import { z } from 'zod';

/**
 * Category type enumeration
 * @readonly
 * @enum {string}
 */
export const CategoryTypeSchema = z.enum(['income', 'expense']);

/**
 * Hex color pattern
 */
const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;

/**
 * Category schema
 */
export const CategorySchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  type: CategoryTypeSchema,
  color: z.string().regex(hexColorPattern, 'Cor deve ser um hex válido (#RRGGBB)'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  parentId: z.string().nullable().optional(),
  isDefault: z.boolean().default(false),
  createdAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Data de criação inválida'),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Data de atualização inválida'),
});

/**
 * Schema for creating a new category (without id, createdAt, updatedAt)
 */
export const CreateCategorySchema = CategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema for updating a category (all fields optional except id)
 */
export const UpdateCategorySchema = CategorySchema.partial().required({ id: true });

/**
 * Type inference from schemas
 * @typedef {z.infer<typeof CategorySchema>} Category
 * @typedef {z.infer<typeof CategoryTypeSchema>} CategoryType
 * @typedef {z.infer<typeof CreateCategorySchema>} CreateCategory
 * @typedef {z.infer<typeof UpdateCategorySchema>} UpdateCategory
 */
