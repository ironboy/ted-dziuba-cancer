# ted-dziuba-cancer
Ted is blocking - here is the solution... This is just a fast response to:
http://widgetsandshit.com/teddziuba/2011/10/node-js-is-cancer.html
and probably this post too:
http://widgetsandshit.com/teddziuba/2011/10/straight-talk-on-event-loops.html

If Ted hasn't been strangled by Python yet I hope he will respond. :)

> If there's one thing web developers love, it's knowing better than conventional wisdom, but conventional wisdom is conventional for a reason: that shit works. Something's been bothering me for a while about this node.js nonsense, but I never took the time to figure it out until I read this butthurt post from Ryan Dahl, Node's creator. I was going to shrug it off as just another jackass who whines because Unix is hard. 

Well Ted, conventional wisdom would be limited to "caves are nice places to live in" if nobody ever tried out new ideas. "Attack people who have new ideas" seems to be your idea of conventional wisdom. Which of course is a brilliant idea if you want to stay in your cave.

> But, like a police officer who senses that something isn't quite right about the family in a minivan he just pulled over and discovers fifty kilos of black horse heroin in the back, I thought that something wasn't quite right about this guy's aw-shucks sob story, and that maybe, just maybe, he has no idea what he is doing, and has been writing code unchecked for years.

Or maybe Ryan Dahl had a really creative idea, since quite a few people are using and contributing to Node.js? However, since Ted thinks they are all strung out on black horse, maybe all of them are just plain wrong?

> Since you're reading about it here, you probably know how my hunch turned out. Node.js is a tumor on the programming community, in that not only is it completely braindead, but the people who use it go on to infect other people who can't think for themselves, until eventually, every asshole I run into wants to tell me the gospel of event loops. Have you accepted epoll into your heart?

Yes, resistance is useless Ted -- although you clearly are such a brave revolutionary. After all conventional wisdom according to you would be to legalize Python, forbid JavaScript and peace out - right? However: Try to know your enemy -- I guess in your case this would be equal to learning a few basics about JavaScript -- before starting a battle.

> A Scalability Disaster Waiting to Happen... Let's start with the most horrifying lie: that node.js is scalable because it "never blocks" (Radiation is good for you! We'll put it in your toothpaste!). On the Node home page, they say this: "Almost no function in Node directly performs I/O, so the process never blocks. Because nothing blocks, less-than-expert programmers are able to develop fast systems." This statement is enticing, encouraging, and completely fucking wrong. Let's start with a definition, because you Reddit know-it-alls keep your specifics in the pedantry. A function call is said to block when the current thread of execution's flow waits until that function is finished before continuing. Typically, we think of I/O as "blocking", for example, if you are calling socket.read(), the program will wait for that call to finish before continuing, as you need to do something with the return value.

Ted -- you are such a bright lad: Hey, you even know what a function call is! Probably that is because they exist in programming languages you have bothered to learn. Had you bothered to learn JavaScript you would have known that it is asynchronous at heart -- making it really easy to avoid blocking when running long-winding functions. Instead you can just let other functions execute in parallel. (I will give you a *simple* example soon.)

> Here's a fun fact: every function call that does CPU work also blocks. 

Yes, but in JavaScript you can decide for how long -- let's say you only allow a function to block for a maximum of 10 ms, then you can run other functions in between before you get back to the first function. And also ensure that all the other functions will only block for 10 ms each. That's a smart way to share the CPU power within one thread.

But now I guess you are in for a long rant Ted. So give it your best shot! (And dear reader, all the code examples and "measurements" in between quotes from Ted are his own.)

> This function, which calculates the n'th Fibonacci number, will block the current thread of execution because it's using the CPU.</blockqoute>

```javascript
function fibonacci(n) {
  if (n < 2)
    return 1;
  else
    return fibonacci(n-2) + fibonacci(n-1);
}
```
> (Yes, I know there's a closed form solution. Shouldn't you be in front of a mirror somewhere, figuring out how to introduce yourself to her?.) Let's see what happens to a node.js program that has this little gem as its request handler:
```javascript
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(fibonacci(40));
}).listen(1337, "127.0.0.1");
```
> On my older laptop, this is the result:
```
ted@lorenz:~$ time curl http://localhost:1337/
165580141
real  0m5.676s
user  0m0.010s
sys 0m0.000s
```
> 5 second response time. Cool. So we all know JavaScript isn't a terribly fast language, but why is this such an indictment? It's because Node's evented model and brain damaged fanboys make you think everything is OK. In really abusive pseudocode, this is how an event loop works:
```
while(1) {
  ready_file_descriptor = event_library->poll();
  handle_request(ready_file_descriptor);
}
```

> That's all well and good if you know what you're doing, but when you apply this to a server problem, you've pluralized that shit. If this loop is running in the same thread that handle_request is in, any programmer with a pulse will notice that the request handler can hold up the event loop, no matter how asynchronous your library is. So, given that, let's see how my little node server behaves under the most modest load, 10 requests, 5 concurrent:

```
ted@lorenz:~$ ab -n 10 -c 5 http://localhost:1337/
Requests per second:    0.17 [#/sec] (mean)
```

> 0.17 queries per second. Diesel. Sure, Node allows you to fork child processes, but at that point your threading/event model is so tightly coupled that you've got bigger problems than scalability. Considering Node's original selling point, I'm God Damned terrified of any "fast systems" that "less-than-expert programmers" bring into this world.

Right, you are so *diesel* Ted - that's an impressive bunch of pseudo-science. I guess your old laptop must be from the beginning of the 80:s? Because I can easily do 10,000 queries/second for *fibonacci(40)* in Node.js on my old laptop -- in one single thread. And then I am running a really naive implementation of Fibonacci. *Diesel* enough for you? Maybe you are just implementing things in a real stupid way?

```
admin$: All 10000 requests for Fib'40 done in 804 ms.
```
Maybe my algorithm is slighlty less stupid, but that is not the point of the argument. "Blocking" was your point, right? So to get close to experiening the risk of "blocking" I will perform my test in a different way... I will do 50 parallell requests for *Fibonacci numbers* between 4,000-40,000 (randomly chosen). On such a cancerous platform as Node.js this will surely block things *forever*, right Ted?

My results? In a single thread this took 3-4 seconds. And the lower numbers (easier calculations) finished first.

```
All 50 request for Fib'4000-40000 done in 3388.65 ms
```

Then if I thread this (yes -- I am sorry Ted -- that's a breeze todo in Node.js) and limit the threads to use a maximum of 4 cpu:s I get results around 1 second:

```
All 50 request for Fib'4000-40000 done in 1036.39 ms
```

But that's just on my old laptop. The code I used was:

```javascript
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
    console.log('simpleThreads.stats:\n',JSON.stringify(simpleThreads.stats,'', '  '));
  }
}

new Test();
```

And this is my *package.json* file. (Yes, Ted - *npm* is the package manager that we use in Node.js):

```json
{
  "name": "nocancer",
  "version": "1.0.0",
  "description": "Node.js is not cancer",
  "main": "app.js",
  "author": "Thomas Frank",
  "license": "MIT",
  "dependencies": {
    "big-integer": "^1.6.23",
    "fair-share": "^1.0.4",
    "precise-timer": "^1.0.0",
    "random-int": "^1.0.0",
    "simple-threads": "^1.0.0"
  }
}
```
*Diesel* enough, Ted? :) Oh, what's that? You want to rant somemore?

> Node Punishes Developers Because it Disobeys the Unix Way... A long time ago, the original neckbeards decided that it was a good idea to chain together small programs that each performed a specific task, and that the universal interface between them should be text. If you develop on a Unix platform and you abide by this principle, the operating system will reward you with simplicity and prosperity. As an example, when web applications first began, the web application was just a program that printed text to standard output. The web server was responsible for taking incoming requests, executing this program, and returning the result to the requester. We called this CGI, and it was a good way to do business until the micro-optimizers sank their grubby meathooks into it. Conceptually, this is how any web application architecture that's not cancer still works today: you have a web server program that's job is to accept incoming requests, parse them, and figure out the appropriate action to take. That can be either serving a static file, running a CGI script, proxying the connection somewhere else, whatever. The point is that the HTTP server isn't the same entity doing the application work. Developers who have been around the block call this separation of responsibility, and it exists for a reason: loosely coupled architectures are very easy to maintain. And yet, Node seems oblivious to this. Node has (and don't laugh, I am not making this shit up) its own HTTP server, and that's what you're supposed use to serve production traffic. Yeah, that example above when I called http.createServer(), that's the preferred setup. If you search around for "node.js deployment", you find a bunch of people putting Nginx in front of Node, and some people use a thing called Fugue, which is another JavaScript HTTP server that forks a bunch of processes to handle incoming requests, as if somebody maybe thought that this "nonblocking" snake oil might have an issue with CPU-bound performance. If you're using Node, there's a 99% probability that you are both the developer and the system administrator, because any system administrator would have talked you out of using Node in the first place. So you, the developer, must face the punishment of setting up this HTTP proxying orgy if you want to put a real web server in front of Node for things like serving statics, query rewriting, rate limiting, load balancing, SSL, or any of the other futuristic things that modern HTTP servers can do. That, and it's another layer of health checks that your system will need. Although, let's be honest with ourselves here, if you're a Node developer, you are probably serving the application directly from Node, running in a screen session under your account.

I hope you feel better now, Ted. So let me give you a quick reply: I have been a web developer for 20 years. And I have used IIS, Apache, nginx and node.js as server platforms. Among the servers-side languages I have used are: Perl, VisualBasic, C#, PHP and JavaScript. Right now I am using a reverse-proxy written in JavaScript for node.js as the front of all trafffic to a server serving a very large number of pages a day across several domains (and yes, this reverse-proxy takes care of all the SSL too). Behind the proxy lives an Apache server and several Node.js servers, running apps written in PHP and JavaScript, with db-connections to MySQL and MongoDB. This reverse-proxy never even flinches. It is fast. It is stable. It's average cpu usage is like 10% of one core on a server with 10 cores. The only comparable throughput I've seen is in nginx. The setup time for the node.js reverse-proxy server? A fraction of the time and heartache of a similar nginx server.

What's that Ted? Not done? Ok.

> It's Fucking JavaScript. This is probably the worst thing any server-side framework can do: be written in JavaScript.

```javascript
if (typeof my_var !== "undefined" && my_var !== null) {
  // you idiots put Rasmus Lerdorf to shame
}
```
>  What is this I don't even...

Oh, Ted, to set a variable to null in JavaScript gives it a value. So just:
```javascript
if(typeof my_var != "undefined"){ /*my_var is defined*/ }
```

> tl;dr Node.js is an unpleasant software library and I will not use it.

Ted, I understand you so well. I used to be like you when I was... five years old? But Node.js is a fast, performant server platform. I understand that you don't use it. That would require half a brain. And there is obviously something blocking your brain. It's called racism -- a prejudice towards things you don't understand and are afraid of. Unfortunately there is no amount of new, bright technology that can stop this blocking. Only you can -- by changing your attitude. :)
