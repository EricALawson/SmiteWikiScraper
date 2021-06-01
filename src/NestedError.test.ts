import  NestedError  from "./NestedError"

test('constructor works', () => {
    const innerErr = new Error('inner error msg');
    const err = new NestedError('msg', innerErr, ['some arg'], 'some func name');
    expect(err.message).toBe('msg');
    expect(err.stack).toBeTruthy();
    expect(err.args).toBeTruthy();
    expect(err.innerErr).toBe(innerErr);
    expect(err.innerErr.message).toBe('inner error msg');
})