'use strict'

/*
    Accept input of N (integer).
    Output the first N Fibonacci numbers, and
    the first N prime numbers.  
    Processing should occur in parallel.
    Event emitting and event handlers are used
    to better show that processing is occurring in parallel.
*/


const fs = require('fs');
const https = require('https');
const { toNumber, isNumber, isInteger, reduce, sum } = require("lodash");
const events = require("events");
const { format } = require("util");
const { exit } = require("process");
const isPrime = require("is-prime-value");
const readline = require("readline");
const { fstat } = require("fs");

let N = 0;
let capture = ["output"];
let output = "";

const eventEmitter = new events.EventEmitter();

// Event handlers

const primeNumberHandler = (i, prime_number) => {
    output = format(`PRIME %d: %d`, i, prime_number);
    capture.push(output);
}

const fibRecursiveHandler = (i, fibonacci_number) => {
    output=format(`FIB %d: %d`, i, fibonacci_number);
    capture.push(output);
}

const fibReducerHandler = (i, fibonacci_number) => {
    output=format(`FIB_REDUCER %d: %d`, i, fibonacci_number);
    capture.push(output);
}

// Fibonacci and Prime async functions

const fibonacci_recursive = async (n) => {
    // fibonacci_results are emitted here to show 
    // that functioning is occurring in parallel with primes()
    let result = 0;
    if (n <= 0) {
        result = 0;
        eventEmitter.emit("fibonacci", n, result);
        return result;
    } else if (n === 1) {
        result = 1;
        eventEmitter.emit("fibonacci", n, result);
        return result;
    } else {
        // do recursive stuff
        const fib = fibonacci_recursive;
        const last_number = await fib(n-1);
        const previous_number = await fib(n-2);
        result = Promise.all([last_number, previous_number]).then((values) => {
            let fib_sum = sum(values);
            eventEmitter.emit("fibonacci", n, fib_sum);
            return fib_sum;
        }).catch((err) => {
            console.log(err.message)
            return null;
        });
    }
    return result;
};

const fibonacci_reducer = async(n) => {
    // This calls the fibonacci_recursive inside the reducer
    let array = new Array(n+1);
    let filled = array.fill(1);
    const reduced = await reduce(filled, async(result, _, i) => {
        result[i] = await fibonacci_recursive(i);
        eventEmitter.emit("fibonacci_reducer", i, result[i]);
        return result;
    }, []);
    return Promise.resolve(reduced[n]);
}

const primes = async (n) => {
    let i = 0;
    let prime_count = 0;
    do {
        if (isPrime(i)) {
            prime_count++;
            eventEmitter.emit("prime", prime_count, i);
        }
        i++;
    } while (prime_count < n);
    return;
}

// Event Listeners

eventEmitter.addListener('fibonacci', fibRecursiveHandler);
eventEmitter.addListener('fibonacci_reducer', fibReducerHandler);
eventEmitter.addListener('prime', primeNumberHandler);

// Webhook function
const webhook = (captured_output) => {
    //"https://hooks.glip.com/webhook/[see instructions for full path]";
    const hostname = "hooks.glip.com";
    const path = "/webhook/[see instructions for full path]";
    const payload = {};
    const content = fs.readFileSync(__filename, "utf8");
    const title = "Susan Imrie";
    const activity = "Skills Assessment for [Company Name]";
    const github = "https://github.com/simrie/fibonacci_primes_parallel_async_node";
    const body = format(`index.js:\n%s\n\n%s`, content, captured_output);
    payload['title'] = title;
    payload['activity'] = activity;
    payload['github'] = github;
    payload['body'] = body;
    const data = JSON.stringify(payload);
    const options = {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
    }
    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
      
        res.on('data', d => {
          process.stdout.write(d);
        })
    });
      
    req.on('error', error => {
        console.error(error);
    })
      
    req.write(data);
    req.end();
    
}

// Console input handler is the main entry point
const mainEntryPoint = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// This is where the program starts
mainEntryPoint.question(`Until I reach what integer should I process Fibonacci numbers? `, N => {
    // Validate the input as a positive integer
    N = toNumber(N);
    if (isNaN(N)) {
        console.log(`Your input is not a number. Quitting.`)
        mainEntryPoint.close()
        exit(0);
    }
    if (!isInteger(N)) {
        console.log(`Your input is not an integer. Quitting.`)
        mainEntryPoint.close()
        exit(0);
    }
    if (isNumber(N) && N < 0) {
        console.log(`Your input is not a positive integer.  Quitting.`)
        mainEntryPoint.close()
        exit(0);
    }
    // Proceed with processing
    mainEntryPoint.close()
    console.log(`Processing Fibonacci and prime numbers up to ${N}.`)
    // To better show asynchronous parallel processing with the output
    // I have the fibonacci_reducer() calling fibonacci_recursive();
    fibonacci_reducer(N);
    primes(N);
    // Setting timeout make sure the capture array gathered all output
    setTimeout(function() {
        const captured_output = capture.join("\n");
        // insert call to "extra credit" webhook call here
        webhook(captured_output);
    }, 1000);
})
