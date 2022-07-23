import { Aggregate, DomainEvents, Result, ValueObject } from "../../lib/core";
import { ISettings, IResult, IHandle, IDomainEvent } from "../../lib/types";

describe('aggregate', () => {

	describe('aggregate native methods', () => {

		interface Props {
			name: string;
		}

		class AggregateErr extends Aggregate<Props> {
			private constructor(props: Props, id?: string, config?: ISettings) {
				super(props, id, config)
			}
		}

		it('should return fails if provide a null value', () => {
			const obj = AggregateErr.create(null);
			expect(obj.isFailure()).toBeTruthy();
		});

		it('should return fails if provide an undefined value', () => {
			const obj = AggregateErr.create(undefined);
			expect(obj.isFailure()).toBeTruthy();
		});

		it('should create a valid aggregate', () => {
			const obj = AggregateErr.create({ name: 'Jane' }, '23366cbf-86cd-4de3-874a-5a11b4fe5dac');
			expect(obj.isFailure()).toBeFalsy();
			expect(obj.value().get('name')).toBe('Jane');
			expect(obj.value().hashCode().value()).toBe('[Aggregate@AggregateErr]:23366cbf-86cd-4de3-874a-5a11b4fe5dac')
		});
	});

	describe('basic-aggregate', () => {

		interface Props {
			name: string;
			age: number;
		}

		class BasicAggregate extends Aggregate<Props> {
			private constructor(props: Props, id?: string) {
				super(props, id)
			}

			public static create(props: Props, id?: string): Result<BasicAggregate> {
				return Result.success(new BasicAggregate(props, id));
			}
		}

		it('should create a basic aggregate with success', () => {

			const agg = BasicAggregate.create({ name: 'Jane Doe', age: 21 });
	
			expect(agg.value().id).toBeDefined();

			expect(agg.value().isNew()).toBeTruthy();

			expect(agg.value().get('name')).toBe('Jane Doe');

		});

		it('should create a basic aggregate with a provided id', () => {
			const agg = BasicAggregate.create({ name: 'Jane Doe', age: 18 }, '8b51a5a2-d47a-4431-884a-4c7d77e1a201');

			expect(agg.value().isNew()).toBeFalsy();

			expect(agg.value().hashCode().value())
				.toBe('[Aggregate@BasicAggregate]:8b51a5a2-d47a-4431-884a-4c7d77e1a201');
		});

		it('should change attributes values with default function', () => {
			const agg = BasicAggregate.create({ name: 'Jane Doe', age: 23 });

			expect(agg.value().id.value()).toBeDefined();

			expect(agg.value().get('name')).toBe('Jane Doe');
			expect(agg.value().get('age')).toBe(23);

			agg.value().set('age').to(18).set('name').to('Anne');
			expect(agg.value().get('age')).toBe(18);
			expect(agg.value().get('name')).toBe('Anne');

			agg.value().change('age', 21).change('name', 'Louse');
			expect(agg.value().get('age')).toBe(21);
			expect(agg.value().get('name')).toBe('Louse');
		});
	});

	describe('aggregate with value objects', () => {

		interface Props { value: number };

		class AgeVo extends ValueObject<Props>{
			private constructor(props: Props) {
				super(props)
			}

			public static isValidValue(value: number): boolean {
				return this.validator.number(value).isBetween(0, 130);
			}

			public static create(props: Props): IResult<ValueObject<Props>> {
				if (!this.isValidValue(props.value)) return Result.fail('Invalid value');
				return Result.success(new AgeVo(props));
			}
		}

		it('should returns false if provide a negative value', () => {
			expect(AgeVo.isValidValue(-1)).toBeFalsy();
		});

		it('should returns false if provide a value greater than 129', () => {
			expect(AgeVo.isValidValue(130)).toBeFalsy();
		});

		it('should returns true if number is greater than 0 and less than 130', () => {
			expect(AgeVo.isValidValue(1)).toBeTruthy();
			expect(AgeVo.isValidValue(129)).toBeTruthy();
		});

		interface AggProps {
			age: AgeVo;
		}
		class UserAgg extends Aggregate<AggProps>{
			private constructor(props: AggProps, id?: string) {
				super(props, id);
			}
			
			public static create(props: AggProps, id?: string): IResult<Aggregate<AggProps>> {
				return Result.success(new UserAgg(props, id));
			}
		}

		it('should create a user with success', () => {

			const age = AgeVo.create({ value: 21 }).value();
			const user = UserAgg.create({ age });

			expect(user.isSuccess()).toBeTruthy();
			
		});

		it('should get value from age with success', () => {

			const age = AgeVo.create({ value: 21 }).value();
			const user = UserAgg.create({ age }).value();

			const result = user
				.get('age')
				.get('value');

			expect(result).toBe(21);
			
		});

		it('should set a new age with success and navigate on history', () => {

			const age = AgeVo.create({ value: 21 }).value();
			const user = UserAgg.create({ age }).value();

			expect(user.get('age').get('value')).toBe(21);

			const age18 = AgeVo.create({ value: 18 }).value();
			
			expect(user.history().count()).toBe(1);

			const result = user
				.set('age')
				.to(age18);
			
			expect(result.get('age').get('value')).toBe(18);
			
			expect(user.history().count()).toBe(2);

			user.history().back();

			expect(result.get('age').get('value')).toBe(21);

			user.history().forward();

			expect(result.get('age').get('value')).toBe(18);
		});

	});

	describe('createdAt and updatedAt', () => {

		interface AggProps {
			name: string;
			createdAt?: Date;
			updatedAt?: Date;
		}
		class UserAgg extends Aggregate<AggProps>{
			private constructor(props: AggProps, id?: string) {
				super(props, id);
			}
			
			public static create(props: AggProps, id?: string): IResult<Aggregate<AggProps>> {
				return Result.success(new UserAgg(props, id));
			}
		}
		it('should create a new date if props are defined on props', () => {
			const agg = UserAgg.create({ name: 'Leticia' });

			expect(agg.value().get('createdAt')).toBeDefined();
			expect(agg.value().get('createdAt')).toBeDefined();
			expect(agg.value().toObject().name).toBe('Leticia');
		});

		it('should create a date from props if provide value', () => {
			process.env.TZ = 'UTC';
			const createdAt = new Date('2022-01-01T03:00:00.000Z');
			const updatedAt = new Date('2022-01-01T03:00:00.000Z');
			const agg = UserAgg.create({ name: 'Leticia', createdAt, updatedAt });

			expect(agg.value().get('createdAt')).toEqual(new Date('2022-01-01T03:00:00.000Z'));
			expect(agg.value().get('updatedAt')).toEqual(new Date('2022-01-01T03:00:00.000Z'));
		});

		it('should update a the value of updatedAt if change some prop', () => {
			process.env.TZ = 'UTC';
			const createdAt = new Date('2022-01-01T03:00:00.000Z');
			const updatedAt = new Date('2022-01-01T03:00:00.000Z');
			const agg = UserAgg.create({ name: 'Leticia', createdAt, updatedAt });
			expect(agg.value().get('updatedAt')).toEqual(new Date('2022-01-01T03:00:00.000Z'));
			agg.value().set('name').to('Lana');
			expect(agg.value().get('updatedAt')).not.toEqual(new Date('2022-01-01T03:00:00.000Z'));
		});

		it('should add domain event', async () => {

			class Handler implements IHandle<UserAgg> {
				eventName: string = 'Handler Event';
				dispatch(event: IDomainEvent<UserAgg>): void | Promise<void> {
					console.log(event.aggregate.toObject());
				}
			}

			const agg = UserAgg.create({ name: 'Jane' }).value();

			agg.addEvent(new Handler(), 'REPLACE_DUPLICATED');

			expect(DomainEvents.events.total()).toBe(1);

			agg.deleteEvent('Handler Event');

			expect(DomainEvents.events.total()).toBe(0);
		});

		it('should add domain event', async () => {

			class Handler implements IHandle<UserAgg> {
				eventName: string = 'Handler Event';
				dispatch(event: IDomainEvent<UserAgg>): void | Promise<void> {
					console.log(event.aggregate.toObject());
				}
			}

			const agg = UserAgg.create({ name: 'Jane' }).value();

			agg.addEvent(new Handler(), 'REPLACE_DUPLICATED');

			expect(DomainEvents.events.total()).toBe(1);

			DomainEvents.dispatch({ eventName: 'Handler Event', id: agg.id })

			expect(DomainEvents.events.total()).toBe(0);
		});

		it('should add domain event', async () => {

			class Handler implements IHandle<UserAgg> {
				eventName = undefined;
				dispatch(event: IDomainEvent<UserAgg>): void | Promise<void> {
					console.log(event.aggregate.toObject());
				}
			}

			const agg = UserAgg.create({ name: 'Jane' }).value();

			agg.addEvent(new Handler(), 'REPLACE_DUPLICATED');

			expect(DomainEvents.events.total()).toBe(1);

			DomainEvents.dispatch({ eventName: Handler.name, id: agg.id })

			expect(DomainEvents.events.total()).toBe(0);
		});
	});
});
