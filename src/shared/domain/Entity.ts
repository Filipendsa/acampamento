export abstract class Entity<TId extends string = string> {
  public readonly id: TId;

  protected constructor(id: TId) {
    this.id = id;
  }

  public equals(other?: Entity<TId>): boolean {
    if (!other || !(other instanceof Entity)) {
      return false;
    }
    return this.id === other.id;
  }
}
