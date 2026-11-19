import { DomainEvent } from './DomainEvent';
import { Entity } from './Entity';

export abstract class AggregateRoot<TId extends string = string> extends Entity<TId> {
  private readonly _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
