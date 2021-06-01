export async function batchProcess<T, V>(
    targets: T[],
    batchSize: number,
    processOne: (ScrapeTarget: T) => Promise<V>
): Promise<void[]> {
    const iter = targets.values()
    const createConsumer = () => {
        return new Promise<void>(function next(resolve) {
            const { value, done } = iter.next()
            if (done) {
                resolve();
            } else {
                processOne(value)
                    .then(() => { return; }) //TODO: increment progress
                    .then(() => next(resolve))
            }
        })
    }
    const promises = Array.from({ length: batchSize }, async _ => {
        return createConsumer();
    });
    return Promise.all(promises);
}