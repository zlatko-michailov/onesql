import * as LexTest from "./onesql.test.lex";

function run(): boolean {
    let passed: boolean = true;
    
    hacks();

    passed = execute("LexTest.blankSpace", LexTest.blankSpace) && passed;
    passed = execute("LexTest.comments", LexTest.comments) && passed;
    passed = execute("LexTest.literals", LexTest.literals) && passed;
    passed = execute("LexTest.keywords", LexTest.keywords) && passed;
    passed = execute("LexTest.punctuation", LexTest.punctuation) && passed;
    passed = execute("LexTest.operations", LexTest.operations) && passed;
    passed = execute("LexTest.identifiers", LexTest.identifiers) && passed;
    passed = execute("LexTest.batch", LexTest.batch) && passed;
    
    log(LogLevel.Important);
    log(LogLevel.Important, "==============");
    log(LogLevel.Important, passed ? "    PASSED" : "+++ FAILED +++" );
    log(LogLevel.Important, "==============");
    
    return passed;
}

function hacks() : void {
    // HACK HERE...
}

export function log(level: string, message?: string, ...args: any[]): void {
    if (message) {
        let levelMessage: string = level + message;
        
        if (args && args.length > 0) {
            console.log(levelMessage, args);
        }
        else {
            console.log(levelMessage);
        }
    }
    else {
        console.log(level);
    }
}

export function areEqual<T>(expected: T, actual: T, logLevel: string, message: string) : boolean {
    let passed = true;
    
    if (expected instanceof Object) {
        for (let prop in expected) {
            passed = areEqual(expected[prop], actual[prop], logLevel, message + "." + prop) && passed;
        }
    }
    else {
        passed = expected === actual;
        let text = (passed ? "P" : "F") + ": " + message;
        log(logLevel, text, { expected: expected, actual: actual });
    }

    return passed;
}

export function areEqualArrays<T>(expected: ReadonlyArray<T>, actual: ReadonlyArray<T>, logLevel: string, message: string) : boolean {
    let passed = areEqual(expected.length, actual.length, logLevel, message + ".length");
    
    for (let i: number = 0; i < expected.length; i++) {
        passed = areEqual(expected[i], actual[i], logLevel, message + "[" + i + "]") && passed;
    }

    return passed;
}

export function isUndefined(actual: any, logLevel: string, message: string) : boolean {
    let passed = undefined === actual;
    let text = (passed ? "P" : "F") + ": " + message;
    
    log(logLevel, text, { actual: actual });
    return passed;
}

/*export function throws(expectedCode: Util_Errors.ErrorCode, action: () => any, logLevel: string, message: string) : boolean {
    let passed = false;
    
    try {
        action();
        
        log(logLevel, "F: " + message, { expected: expectedCode });
    }
    catch (ex) {
        passed = areEqual(expectedCode, ex.code, logLevel, message);
    }
    
    return passed;
}*/
    
    
export class LogLevel {
    static readonly Important: string = "";
    static readonly Info: string = "|   ";
    static readonly Detail: string = "|   |   ";
    static readonly Verbose: string = "|   |   |   ";
}

function execute(testName: string, testMethod: () => boolean): boolean {
    log(LogLevel.Important);
    log(LogLevel.Important, testName);
    log(LogLevel.Important, "---------------------------------------");
    
    let passed: boolean = testMethod();
    log(LogLevel.Important, passed ? "PASSED" : "+++ FAILED +++" );
    
    return passed;
}

run();
