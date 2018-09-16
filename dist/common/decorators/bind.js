export default function bind(target, propertyKey, descriptor) {
    return {
        configurable: true,
        get() {
            const bound = descriptor.value.bind(this);
            Object.defineProperty(this, propertyKey, {
                value: bound,
                configurable: true,
                writable: true
            });
            return bound;
        }
    };
}
//# sourceMappingURL=bind.js.map