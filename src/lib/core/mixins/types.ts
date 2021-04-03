// todo: move this code/file to the utilities folder?

export type Function<T = any> = (...input: any[]) => T;
export type Constructor<T = {}> = new (...args: any[]) => T;
export type Mixin<T extends Function> = InstanceType<ReturnType<T>>;
