// Load modules
const simpleThreads = require('simple-threads');

simpleThreads.require(
  'Timer:precise-timer',
  'random-int',
  'big-integer',
  'fair-share'
);


// Set a maximum of cpu's to use for threads
// (set this to 1 to run single-threaded)
simpleThreads.maxChildren = 4;


// Calculate Fibonacci numbers threaded and with interrupts
class Fibonacci {


  static async calc(n){
    // Run the method algo as a thread
    return await this.algo.run(n);
  }

  // Calculate a fibonacci number
  static async algo(n){

    let req = n, share = new fairShare(),
        a = bigInteger(1), b = bigInteger(0);

    while (n--){
      let temp = a;
      a = a.plus(b);
      b = temp;
      // Let other functions run in parallell after 10 ms
      await share.do(); 
    }

    return {
      request: req,
      stats: share.stats,
      result: b.toString()
    };

  }

}


// Calculate 50 Fibonacci numbers between 4000 and 40000

class Test {

  constructor(){
    Object.assign(this,{
      todo: 50,
      done: 0,
      timer: new Timer()
    });
    this.calc();
  }

  calc(){
    for(let i = 1; i <= this.todo; i++){
      Fibonacci.calc(randomInt(4000,40000)).then(
        (x)=>{this.result(i,x);}
      );
    }
  }

  result(i,x){
    console.log(
      'Test ' + i + '\n' +
      'time taken: ' + this.timer.elapsed +
      'ms' + '\n' + JSON.stringify(x,'',' ') + '\n\n'
    );
    this.done++;
    this.done == this.todo && this.report();
  }

  report(){
    console.log(
      'All ' + this.todo + ' done in ' + this.timer.elapsed + ' ms'
    );

    // Some statistics about cpu-usage etc from simpleThreads
    console.log('simpleThreads.stats:\n',simpleThreads.stats);
  }
}

new Test();
