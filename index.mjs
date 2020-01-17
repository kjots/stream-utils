import util from 'util';

const timeout = util.promisify(setTimeout);

export default {};

export async function doit() {
    console.log('*** [index] Doing it!');

    await timeout(1000);

    console.log('*** [index] Did it!');
}