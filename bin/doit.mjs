import { doit } from '..';

(async function() {
    console.log('*** [bin/doit] I\'m going to do it!');

    await doit();

    console.log('*** [bin/doit] I did it!');
})();