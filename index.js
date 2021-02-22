'use strict'

/*
    Accept input of N (integer).
    Output the first N Fibonacci numbers, and
    the first N prime numbers, in parallel.
*/


//const fs = require('fs');
const { toNumber, isInteger, reducer, sum } = require("lodash");
const events = require("events");
const { format } = require("util");
const { exit } = require("process");
const isPrime = require("is-prime-value");
const readline = require("readline");


let prime_count = 0;
let fib_count = 0;
let N = 0;
let capture = ["output:"];
let output = "";


const eventEmitter = new events.EventEmitter();

const primeNumberHandler = (i, prime_number) => {
    output = format(`PRIME %d: %d`, i, prime_number);
    //console.log(output);
    capture.push(output);
}

const fibNumberHandler = (i, fibonacci_number) => {
    output=format(`FIB %d: %d`, i, fibonacci_number);
    //console.log(output);
    capture.push(output);
}

const fibonacci_recursive = async (n) => {
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
            if (n > 1) {
                eventEmitter.emit("fibonacci", n, fib_sum);
            }
            return fib_sum;
        }).catch((err) => {
            console.log(err.message)
            return null;
        });
        return result;
    }
    return result;
};

const fibonacci_reducer = async(n) => {
    if (n === 0) {
        return 0;
    }
    if (n === 1) {
        return 1;
    }

    let array = new Array(n);
    let filled = array.fill(1);
    let reduced = filled.reduce((acc, _, i) => {
        let res = (i <= 1) ? i : acc[i-2] + acc[i-1];
        acc.push(res);
        eventEmitter.emit("fibonacci", i, res);
        return acc;                          
    },[]);
    const sum_of_last_two_n = reduced[n - 1] + reduced[n - 2];
    eventEmitter.emit("fibonacci", n, sum_of_last_two_n);
    return sum_of_last_two_n;
}

const primes = async (n) => {
    let i = 0;
    let prime_count = 0;
    do {
        prime_count++;
        if (isPrime(i)) {
            eventEmitter.emit("prime", prime_count, i);
        }
        i++;
    } while (prime_count <= n);
    return;
}

eventEmitter.addListener('fibonacci', fibNumberHandler);
eventEmitter.addListener('prime', primeNumberHandler);

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
    console.log(`Processing Fibonacci and prime numbers up to ${N}.`)
    readline_inteface.close()
    fibonacci_recursive(N);
    //fibonacci_reducer(N);
    primes(N);
    setTimeout(function() {
        capture = capture.join("\n");
        console.log(capture);
    }, 1000);
})
