import { batchProcess } from "./batchProcess";

test.only('batch process completes', async () => {
    const arr = [1, 2, 3, 4, 5];
});

// test.skip('proof of concept: resolve n promises at a time', async () => {
//     jest.setTimeout(30000);

//     const data = [10000, 3000, 3000, 3000]
//     const iter = data.values()
//     const processData = async ms => {
//         console.log('starting delay: ', ms);
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 console.log('finished delay: ', ms);
//                 resolve(ms);
//             }, ms)
//         })
//     } 

//     return await Promise.all([createConsumer(), createConsumer()]);
// });