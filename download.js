const fs = require('fs');
const request = require('request');
const ProgressBar = require('progress');
const ObservablePromise = require('./');

const download = url =>
  new ObservablePromise(
    (resolve, reject, { progress, contentLength }) => {
      request(url)
        .on('response', res =>
          contentLength(parseInt(res.headers['content-length'], 10))
        )
        .on('data', data => progress(data.length))
        .on('error', error => reject(error))
        .on('end', () => resolve())
        .pipe(fs.createWriteStream('VirtualBox.zip'));
    },
    {
      progress: ObservablePromise.NonBlocking,
      contentLength: ObservablePromise.NonBlocking
    }
  );

let progressBar;

download('https://speed.hetzner.de/100MB.bin')
  .onContentLength(length => {
    progressBar = new ProgressBar(
      '  downloading [:bar] :rate/bps :percent :etas',
      {
        complete: '=',
        incomplete: ' ',
        width: 50,
        total: length
      }
    );
  })
  .onProgress(prg => progressBar.tick(prg))
  .then(() => console.log('download complete'))
  .catch(error => console.error('error', error));
