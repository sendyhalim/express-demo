var express = require('express');
var app = express();
var helloCount = 0;

app.get('/hello', function (req, res) {
  helloCount++;

  res.send(`Hello World! ${helloCount}`);
});

/**
 * This route will do a long running synchronous operation.
 * Node's event queue state:
 *
 *                                           Queue
 *                           .--------------------------------------.
 * Running operation ------> | /long-running-and-blocking-operation |
 *                           .--------------------------------------.
 *                           | /<another-url> for example /hello    |
 *                           .--------------------------------------.
 *                           | /<another-url> for example /hello    |
 *                           .--------------------------------------.
 * Another request  -------> | /<another-url> for example /hello    |
 *                           .--------------------------------------.
 *
 */
app.get('/long-running-and-blocking-operation', function (req, res) {
  var count = 0;

  while (count < 5000000000) {
    count++;
  }

  res.send(`Count is ${count}`);
});


/**
 * This route will insert to the bottom of the queue a long running synchronous operation
 * Node's event queue state:
 *
 *                                                    Queue
 *                                   .----------------------------------------.
 * Insert long running operation --> | /insert-long-running-operation (below) |
 *                                   .----------------------------------------.
 * The long running operation -----> | <long-running-operation>               |
 *                                   .----------------------------------------.
 *                                   | /<another-url> for example /hello      |
 *                                   .----------------------------------------.
 *                                   | /<another-url> for example /hello      |
 *                                   .----------------------------------------.
 * Another request ----------------> | /<another-url> for example /hello      |
 *                                   .----------------------------------------.
 *
 */
app.get('/insert-long-running-operation', function (req, res) {
  // Insert long running operation to Queue
  process.nextTick(function () {
    var count = 0;

    while (count < 5000000000) {
      count++;
    }
  }, 0);

  res.send('Inserted long running operation');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

