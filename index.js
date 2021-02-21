'use strict'

/*
    Accept input of N (integer).
    Output the first N Fibonacci numbers, and
    the first N prime numbers, in parallel.
*/


//const fs = require('fs');
const { toNumber, isInteger, reducer } = require("lodash");
const events = require("events");
const { format } = require("util");
const { exit } = require("process");
const isPrime = require("is-prime-value");
const readline = require("readline");


let prime_count = 0;
let fib_count = 0;
let N = 0;
let capture = [];
let output = "";


const eventEmitter = new events.EventEmitter();


const primeNumberHandler = function (fib_sum) {
    if (prime_count > N) {
        //return;
    }
    if (isPrime(fib_sum)) {
        prime_count++;
        output = format(`PRIME %d: %d`, prime_count, fib_sum);
        capture.push(output);
    }
}

const fibNumberHandler = function (fib_sum) {
    if (fib_count > N) {
        //return;
    }
    fib_count++;
    output=format(`FIB %d: %d`, fib_count, fib_sum);
    capture.push(output);
}

const fibonacci = function(n) {
    if (n === 1) {
        return 1;
    } else if (n < 1) {
        return "OOPS";
    }

    let array = new Array(n);                              // <---- Starting here
    let filled = array.fill(1);
    let reduced = filled.reduce((acc, _, i) => {
        let res = (i <= 1) ? i : acc[i-2] + acc[i-1];
        acc.push(res);
        eventEmitter.emit("fib_sum", res);
        return acc;                          
    },[]); // <- reduce is initialized with an array (new array),
    const sum_of_last_two_n = reduced[n - 1] + reduced[n - 2];
    eventEmitter.emit("fib_sum", sum_of_last_two_n);
    return sum_of_last_two_n;
}


eventEmitter.addListener('fib_sum', fibNumberHandler);
eventEmitter.addListener('fib_sum', primeNumberHandler);

const readline_inteface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

readline_inteface.question(`Until I reach what integer should I process Fibonacci numbers? `, N => {
    N = toNumber(N);
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
    fibonacci(N);
    capture = capture.join("\n");
    console.log(capture);
})
