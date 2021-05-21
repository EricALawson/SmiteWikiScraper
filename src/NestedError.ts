
export default class NestedError<T extends Error> extends Error {
    stack?: string
    innerErr: T
    functionName?: string
    args?: any[]

    constructor(message: string, innerErr: T, args?: any[], functionName?: string) {
        super(message);
        this.functionName = functionName;
        this.innerErr = innerErr;
        this.args = args;
    }
}
