export interface EntityWithId {
  id: string;
}

export function updateEntityInArray<T extends EntityWithId>(
  entities: T[],
  entityId: string,
  updateFn: (entity: T) => T
): T[] {
  return entities.map((entity) => {
    if (entity.id === entityId) {
      return updateFn(entity);
    }
    return entity;
  });
}
