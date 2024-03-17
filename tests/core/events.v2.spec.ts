import TsEvents from '../../lib/core/events.v2';

describe('events.v2', () => {

    it('should create instance with success', () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(0);
    });

    it('should do nothing if event does not exists', () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        instance.dispatchEvent('not_exists');
        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(0);
    });

    it('should throw if provide empty string as event name', () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        const spy = () => instance.addEvent('', () => { });
        expect(spy).toThrowErrorMatchingInlineSnapshot(`"addEvent: invalid event name "`);
    });

    it('should throw if not provide function as callback', () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        const spy = () => instance.addEvent('not_callback', { execute: () => { } } as any);
        expect(spy).toThrowErrorMatchingInlineSnapshot(`"addEvent: handler for not_callback is not a function"`);
    });

    it('should add and call event with success', () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        let params = null;
        const callback = (...args: any) => params = args;

        instance.addEvent('start', callback);
        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(1);

        instance.dispatchEvent('start');

        expect(instance.metrics.totalDispatched()).toBe(1);
        expect(instance.metrics.totalEvents()).toBe(0);
        expect(params).toMatchObject([{ "age": 21, "name": "Jane" }, [
            {
                "eventName": "start",
                "handler": callback,
                "options": {
                    "priority": 2,
                },
            }
        ]]);
    });

    it('should add and call event with success', () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        let params = null;
        const callback = (...args: any) => params = args;

        instance.addEvent('start', callback);
        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(1);

        instance.dispatchEvent('start', { dto: { some: 'info' } });

        expect(instance.metrics.totalDispatched()).toBe(1);
        expect(instance.metrics.totalEvents()).toBe(0);
        expect(params).toMatchObject([{ "age": 21, "name": "Jane" }, [
            {
                "eventName": "start",
                "handler": callback,
                "options": {
                    "priority": 2,
                },
            },
            {
                dto: { some: 'info' }
            }
        ]]);
    });

    it('should add many events and call event priority 1 as first', async () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        const callback = jest.fn();

        instance.addEvent('first', callback);
        instance.addEvent('second', callback);
        instance.addEvent('third', callback, { priority: 1 });

        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(3);

        await instance.dispatchEvents();

        expect(instance.metrics.totalDispatched()).toBe(3);
        expect(instance.metrics.totalEvents()).toBe(0);
        expect(callback).toHaveBeenNthCalledWith(1, {
            "age": 21,
            "name": "Jane"
        }, [
            {
                "eventName": "third",
                "handler": callback,
                "options": { "priority": 1 }
            }
        ]);
    });

    it('should clear all events', () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        const callback = jest.fn();

        instance.addEvent('first', callback);
        instance.addEvent('second', callback);
        instance.addEvent('third', callback, { priority: 1 });

        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(3);

        instance.clearEvents();
        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(0);
    });

    it('should remove an event by name', () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        const callback = jest.fn();

        instance.addEvent('first', callback);
        instance.addEvent('second', callback);
        instance.addEvent('third', callback, { priority: 1 });

        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(3);

        instance.removeEvent('second');
        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(2);
    });

    it('should replace an existing with the same name', () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        const callback = jest.fn();

        instance.addEvent('first', callback);
        instance.addEvent('first', callback);
        instance.addEvent('first', callback, { priority: 1 });

        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(1);
    });

    it('should resolve many promises', async () => {
        const instance = new TsEvents({ name: 'Jane', age: 21 });
        const callback = () => new Promise((resolve) => resolve(1));

        instance.addEvent('first', callback);
        instance.addEvent('second', callback);
        instance.addEvent('third', callback, { priority: 1 });

        expect(instance.metrics.totalDispatched()).toBe(0);
        expect(instance.metrics.totalEvents()).toBe(3);
        await instance.dispatchEvents();

        expect(instance.metrics.totalDispatched()).toBe(3);
        expect(instance.metrics.totalEvents()).toBe(0);
    });
});
