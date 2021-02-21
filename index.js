'use strict'

/*
    Accept input of N (integer).
    Output the first N Fibonacci numbers, and
    the first N prime numbers, in parallel.
*/


//const _ = require('lodash');
//const fs = require('fs');
const isInteger = require("lodash").isInteger;
const isPrime = require("is-prime-value");
const events = require("events");
const format = require("util").format;
const readline = require("readline");
const { exit } = require("process");

const { event } = events;

let prime_count = 0;
let fib_count = 0;
let N = 7;
let capture = "";
let output = "";


const eventEmitter = new events.EventEmitter();

const processingCompletedHandler = function() {
    output="Processing is completed.";
    capture = format(`%s\n%s`, output, capture);
    console.log(output);
}

const primeNumberHandler = function (fib_sum) {
    if (isNaN(fib_sum)) {
        return;
    }
    if (prime_count > N) {
        return;
    }
    if (isPrime(fib_sum)) {
        prime_count++;
        output = format(`PRIME %d: %d`, prime_count, fib_sum);
        capture = format(`%s\n%s`, output, capture);
        console.log(output);
    }
}

const fibNumberHandler = function (fib_sum) {
    if (isNaN(fib_sum)) {
        return;
    }
    if (fib_count > N) {
        return;
    }
    fib_count++;
    output=format(`FIB %d: %d`, fib_count, fib_sum);
    capture = format(`%s\n%s`, output, capture);
    console.log(output);
}


eventEmitter.addListener('fib_sum', fibNumberHandler);
eventEmitter.addListener('fib_sum', primeNumberHandler);
eventEmitter.addListener('done', processingCompletedHandler);

eventEmitter.emit("fib_sum", 5);
eventEmitter.emit("fib_sum", 6);
eventEmitter.emit("fib_sum", "fish");

const readline_inteface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

readline_inteface.question(`Until I reach what integer should I process Fibonacci numbers? `, N => {
    if (isNaN(N)) {
        console.log(`Your input is not a number. Quitting.`)
        readline_inteface.close()
        exit(0);
    }

    if (!isInteger(N)) {
        
        console.log(`Your input is not an integer. Quitting.`)
        readline_inteface.close()
        exit(0);
    }
    console.log(`Processing Fibonacci numbers up to ${N}.  Prime numbers will be noted.`)
    readline_inteface.close()
    exit(0);
})
