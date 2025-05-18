import { updateEntityInArray, EntityWithId } from "./utils";

interface TestEntity extends EntityWithId {
  value: number;
  name?: string;
}

describe("updateEntityInArray", () => {
  const initialEntities: TestEntity[] = [
    { id: "1", value: 10 },
    { id: "2", value: 20 },
    { id: "3", value: 30 },
  ];

  it("should update an entity when found", () => {
    const entityIdToUpdate = "2";
    const updatedValue = 25;
    const updateFn = (entity: TestEntity) => ({
      ...entity,
      value: updatedValue,
    });

    const result = updateEntityInArray(
      initialEntities,
      entityIdToUpdate,
      updateFn
    );

    const updatedEntity = result.find((e) => e.id === entityIdToUpdate);
    expect(updatedEntity?.value).toBe(updatedValue);
    expect(result.length).toBe(initialEntities.length);
  });

  it("should not modify other entities", () => {
    const entityIdToUpdate = "2";
    const updatedValue = 25;
    const updateFn = (entity: TestEntity) => ({
      ...entity,
      value: updatedValue,
    });

    const result = updateEntityInArray(
      initialEntities,
      entityIdToUpdate,
      updateFn
    );

    const nonUpdatedEntity = result.find((e) => e.id === "1");
    expect(nonUpdatedEntity?.value).toBe(initialEntities[0].value);

    const anotherNonUpdatedEntity = result.find((e) => e.id === "3");
    expect(anotherNonUpdatedEntity?.value).toBe(initialEntities[2].value);
  });

  it("should return the original array content if entity ID is not found", () => {
    const entityIdToUpdate = "nonexistent";
    const updateFn = (entity: TestEntity) => ({ ...entity, value: 99 });

    const result = updateEntityInArray(
      initialEntities,
      entityIdToUpdate,
      updateFn
    );
    expect(result).toEqual(initialEntities);
    initialEntities.forEach((originalEntity, index) => {
      expect(result[index].id).toBe(originalEntity.id);
      expect(result[index].value).toBe(originalEntity.value);
    });
  });

  it("should handle an empty array", () => {
    const emptyEntities: TestEntity[] = [];
    const entityIdToUpdate = "1";
    const updateFn = (entity: TestEntity) => ({ ...entity, value: 99 });

    const result = updateEntityInArray(
      emptyEntities,
      entityIdToUpdate,
      updateFn
    );
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it("should correctly apply the updateFn to the target entity", () => {
    const entityIdToUpdate = "1";
    const newName = "Updated Name";
    const updateFn = (entity: TestEntity) => ({
      ...entity,
      name: newName,
      value: entity.value + 5,
    });

    const result = updateEntityInArray(
      initialEntities,
      entityIdToUpdate,
      updateFn
    );

    const updatedEntity = result.find((e) => e.id === entityIdToUpdate);
    expect(updatedEntity?.name).toBe(newName);
    expect(updatedEntity?.value).toBe(initialEntities[0].value + 5);
  });

  it("should return a new array instance even if no entity is updated", () => {
    const entityIdToUpdate = "nonexistent";
    const updateFn = (entity: TestEntity) => ({ ...entity, value: 99 });
    const result = updateEntityInArray(
      initialEntities,
      entityIdToUpdate,
      updateFn
    );
    expect(result).not.toBe(initialEntities);
    expect(result).toEqual(initialEntities);
  });
});
