import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// ==========================================
// CONSTANTES Y ENUMS (SQLite usa texto para Enums)
// ==========================================
export const batchStatusEnum = ['BACKLOG', 'SOAKING', 'WASHING', 'DRYING', 'READY_TO_FOLD', 'DONE'] as const;
export const eventTypeEnum = ['STATE_CHANGE', 'HANDOFF', 'WEATHER_DELAY', 'ABORT', 'SYSTEM_AUTO_DONE'] as const;
export const waterTempEnum = ['COLD', 'WARM', 'HOT'] as const;
export const cycleTypeEnum = ['EXPRESS', 'DELICATE', 'NORMAL', 'HEAVY'] as const;
export const naggingProfileEnum = ['SOFT', 'MEDIUM', 'HARD'] as const;
export const notificationStatusEnum = ['PENDING', 'DELIVERED', 'DISMISSED', 'ERROR'] as const;
export const notificationTypeEnum = ['REMINDER', 'NAGGING', 'CRITICAL'] as const;

// ==========================================
// DOMINIO DE MULTIUSUARIO & CONFIGURACIÓN
// ==========================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  householdId: text('household_id'), // Nullable para agrupar roomies en v2
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  userId: text('user_id').primaryKey().references(() => users.id),
  defaultWasherMins: integer('default_washer_mins').default(30).notNull(), // Default Express Richardson
  autoDoneDaysThreshold: integer('auto_done_days_threshold').default(3).notNull(), // Tolerancia Silla-Clóset
  naggingProfile: text('nagging_profile', { enum: naggingProfileEnum }).default('MEDIUM').notNull(),
});

// ==========================================
// DOMINIO DE INVENTARIO (El Diccionario)
// ==========================================
export const washRules = sqliteTable('wash_rules', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  waterTemp: text('water_temp', { enum: waterTempEnum }).default('WARM').notNull(),
  cycleType: text('cycle_type', { enum: cycleTypeEnum }).default('EXPRESS').notNull(),
  baseDurationMins: integer('base_duration_mins').default(30).notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(), // Tech, Soft, Armor
  colorHex: text('color_hex'),
  defaultWashRuleId: text('default_wash_rule_id').references(() => washRules.id),
});

export const garments = sqliteTable('garments', {
  id: text('id').primaryKey(), // UUID
  categoryId: text('category_id').references(() => categories.id),
  photoUri: text('photo_uri'),
  hasPrint: integer('has_print', { mode: 'boolean' }).default(false).notNull(), // SQLite false = 0
  isDelicateBlend: integer('is_delicate_blend', { mode: 'boolean' }).default(false).notNull(),
  customWashRuleId: text('custom_wash_rule_id').references(() => washRules.id),
  metadata: text('metadata', { mode: 'json' }), // Para IDs de Whering futuros
});

// ==========================================
// DOMINIO DE FLUJO (Kanban / WIP)
// ==========================================
export const batches = sqliteTable('batches', {
  id: text('id').primaryKey(), // UUID
  status: text('status', { enum: batchStatusEnum }).default('BACKLOG').notNull(),
  priorityScore: integer('priority_score').default(0).notNull(),
  ownerId: text('owner_id').references(() => users.id),
  handlerId: text('handler_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  metadata: text('metadata', { mode: 'json' }),
});

export const batchCategories = sqliteTable('batch_categories', {
  batchId: text('batch_id').notNull().references(() => batches.id),
  categoryId: text('category_id').notNull().references(() => categories.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.batchId, table.categoryId] }),
  };
});

export const batchEvents = sqliteTable('batch_events', {
  id: text('id').primaryKey(), // UUID
  batchId: text('batch_id').notNull().references(() => batches.id),
  eventType: text('event_type', { enum: eventTypeEnum }).notNull(),
  fromStatus: text('from_status', { enum: batchStatusEnum }),
  toStatus: text('to_status', { enum: batchStatusEnum }),
  actorId: text('actor_id').references(() => users.id), // Quién hizo el cambio
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ==========================================
// DOMINIO DE CONTEXTO & MOTOR EJECUCIÓN
// ==========================================
export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id').references(() => users.id),
  activityName: text('activity_name').notNull(), // Gym, Fiesta, etc.
  weight: integer('weight').notNull(),
  loggedAt: integer('logged_at', { mode: 'timestamp' }).notNull(),
});

export const notificationLogs = sqliteTable('notification_logs', {
  id: text('id').primaryKey(), // UUID
  batchId: text('batch_id').notNull().references(() => batches.id),
  type: text('type', { enum: notificationTypeEnum }).notNull(),
  scheduledFor: integer('scheduled_for', { mode: 'timestamp' }).notNull(),
  deliveredAt: integer('delivered_at', { mode: 'timestamp' }),
  status: text('status', { enum: notificationStatusEnum }).default('PENDING').notNull(),
});
