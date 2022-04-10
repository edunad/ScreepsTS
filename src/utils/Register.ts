export function register(id: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if(!global.__registry) global.__registry = {};
        if(!global.__registry[id]) global.__registry[id] = {};

        global.__registry[id][propertyKey] = descriptor.value;
    };
}
