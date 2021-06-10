import cliProgress from 'cli-progress'

export async function batchProcess<T, V>(
    targets: T[],
    batchSize: number,
    processOne: (ScrapeTarget: T) => Promise<V>
): Promise<void[]> {
    const iter = targets.values();
    const progressBar = new cliProgress.SingleBar(
        { 
            format: 'progress [{bar}] | Duration: {duration_formatted} | {value} / {total}'
        }, 
        cliProgress.Presets.shades_classic
    );
    progressBar.start(targets.length, 0);
    const createConsumer = () => {
        return new Promise<void>(function next(resolve) {
            const { value, done } = iter.next()
            if (done) {
                resolve();
            } else {
                processOne(value)
                    .then(() => { progressBar.increment(); })
                    .then(() => next(resolve))
            }
        })
    }
    const consumerPromises = Array.from({ length: batchSize }, async _ => {
        return createConsumer();
    });
    const results = await Promise.all(consumerPromises);
    progressBar.stop();
    return results; 
}