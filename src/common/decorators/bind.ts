
export default function bind<T extends Function>(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void
{
    return {
        configurable: true,
        get(this: T): T {
            const bound: T = descriptor.value.bind(this);
            Object.defineProperty(this, propertyKey, {
                value: bound,
                configurable: true,
                writable: true
            });
            return bound;
        }
    };
}