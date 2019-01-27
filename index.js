function ObservablePromise(mainFn, signiture) {
  const $ = { Q: {}, p: {}, l: {}, processing: 0 };

  Object.keys(signiture).forEach(key => {
    $.Q[key] = [];
    $.l[key] = [];
    $.p[key] = stuff => {
      signiture[key] && ++$.processing;
      $.Q[key].push(stuff);
      Promise.all($.l[key].map(listener => listener(stuff))).then(() => {
        signiture[key] && --$.processing;

        if ($.resolved && !$.processing) {
          console.log('# resolved after last action');
          // ObservablePromise.cleanup($);
          $.resolve($.result);
        }
      });
    };
  });

  const promise = new Promise((resolve, reject) => {
    $.resolve = resolve;
    const _resolve = result => {
      if (!$.processing) {
        console.log('# resolved');
        // ObservablePromise.cleanup($);
        resolve(result);
      } else {
        $.resolved = true;
        $.result = result;
        console.log(
          '# tried resolving, but some blocking operations are still in progress'
        );
      }
    };
    mainFn(_resolve, reject, $.p);
  });

  Object.keys($.Q).forEach(key => {
    promise['on' + key[0].toUpperCase() + key.substr(1)] = listener => {
      // process old
      $.Q[key].forEach(item => listener(item));

      // add listener
      $.l[key].push(listener);

      return promise;
    };
  });

  promise.publish = $.p;
  promise.signiture = signiture;

  return promise;
}

ObservablePromise.cleanup = instance => {
  delete instance.q;
  delete instance.l;
  delete instance.p;
};

ObservablePromise.Blocking = true;
ObservablePromise.NonBlocking = false;

module.exports = ObservablePromise;
