const ObservablePromise = require('./');

const op = new ObservablePromise(
  (resolve, reject, { progress }) => {
    setTimeout(() => resolve('hello'), 1000);

    progress('oh');
    setTimeout(() => progress('yeah'), 100);
    setTimeout(() => progress('hoorrahh'), 900);
  },
  {
    progress: ObservablePromise.Blocking
  }
);

op.onProgress(prg => console.log(prg)).then(msg => console.log(msg));

op.publish.progress('hahahaha');

setTimeout(() => {
  op.onProgress(
    prg =>
      new Promise(resolve =>
        setTimeout(() => {
          console.log('delayed', prg);
          resolve();
        }, 500)
      )
  );
}, 99);
