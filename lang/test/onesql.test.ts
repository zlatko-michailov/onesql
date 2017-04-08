import * as LexTest from "./onesql.test.lex";
import * as SyntaxTest from "./onesql.test.syntax";
import * as MongoTest from "./onesql.test.gen.mongo";

function run(): boolean {
    let passed: boolean = true;
    
    passed = execute("LexTest.blankSpace", LexTest.blankSpace) && passed;
    passed = execute("LexTest.comments", LexTest.comments) && passed;
    passed = execute("LexTest.literals", LexTest.literals) && passed;
    passed = execute("LexTest.keywords", LexTest.keywords) && passed;
    passed = execute("LexTest.punctuation", LexTest.punctuation) && passed;
    passed = execute("LexTest.operations", LexTest.operations) && passed;
    passed = execute("LexTest.identifiers", LexTest.identifiers) && passed;
    passed = execute("LexTest.functions", LexTest.functions) && passed;
    passed = execute("LexTest.batch", LexTest.batch) && passed;
    
    passed = execute("SyntaxTest.empty", SyntaxTest.empty) && passed;
    passed = execute("SyntaxTest.use", SyntaxTest.use) && passed;
    passed = execute("SyntaxTest.from", SyntaxTest.from) && passed;
    passed = execute("SyntaxTest.whereTypeMismatch", SyntaxTest.whereTypeMismatch) && passed;
    passed = execute("SyntaxTest.whereBasic", SyntaxTest.whereBasic) && passed;
    passed = execute("SyntaxTest.whereParentheses", SyntaxTest.whereParentheses) && passed;
    passed = execute("SyntaxTest.wherePriority", SyntaxTest.wherePriority) && passed;
    passed = execute("SyntaxTest.whereFunctions", SyntaxTest.whereFunctions) && passed;

    passed = execute("MongoTest.whereMongo", MongoTest.whereMongo) && passed;

    log(LogLevel.Important);
    log(LogLevel.Important, "==============");
    log(LogLevel.Important, passed ? "    PASSED" : "+++ FAILED +++" );
    log(LogLevel.Important, "==============");
    
    hacks();

    return passed;
}

function hacks() : void {
    // HACK HERE...
}

export function log(level: string, message?: string, ...args: any[]): void {
    if (config.logLevelLimit === undefined || level.length <= config.logLevelLimit.length) {
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
}

export function areEqual<T>(expected: T, actual: T, logLevel: string, message: string) : boolean {
    let passed: boolean = areEqualValues(expected !== undefined, actual !== undefined, logLevel, message + " !== undefined");

    if (passed) {    
        if (expected instanceof Object) {
            for (let prop in expected) {
                passed = areEqual(expected[prop], actual[prop], LogLevel.Indent + logLevel, message + "." + prop) && passed;
            }

            for (let prop in actual) {
                if (!(actual[prop] instanceof Function) && !expected[prop]) {
                    passed = areEqualValues(expected[prop], actual[prop], LogLevel.Indent + logLevel, message + "." + prop) && passed;
                }
            }
        }
        else {
            passed = areEqualValues(expected, actual, logLevel, message);
        }
    }

    return passed;
}

export function areEqualValues<T>(expected: T, actual: T, logLevel: string, message: string) : boolean {
    let passed: boolean = expected === actual;
    let text: string = (passed ? "P" : "F") + ": " + message;
    log(logLevel, text, { expected: expected, actual: actual });

    return passed;
}

export function areEqualArrays<T>(expected: ReadonlyArray<T>, actual: ReadonlyArray<T>, logLevel: string, message: string) : boolean {
    let passed: boolean = areEqual(expected !== undefined, actual !== undefined, logLevel, message + " !== undefined");

    passed = areEqual(expected.length, actual.length, logLevel, message + ".length") && passed;
    
    for (let i: number = 0; i < Math.min(expected.length, actual.length); i++) {
        passed = areEqual(expected[i], actual[i], LogLevel.Indent + logLevel, message + "[" + i + "]") && passed;
    }

    return passed;
}

export function isUndefined(actual: any, logLevel: string, message: string) : boolean {
    let passed: boolean = undefined === actual;
    let text: string = (passed ? "P" : "F") + ": " + message;
    
    log(logLevel, text, { actual: actual });
    return passed;
}

export function throws(expectedException: any, action: () => any, logLevel: string, message: string) : boolean {
    let passed = false;
    
    try {
        action();
        
        log(logLevel, "F: " + message, { expected: "Exception" });
    }
    catch (ex) {
        passed = areEqual(expectedException, ex, logLevel, message);
    }
    
    return passed;
}
    
    
export class LogLevel {
    static readonly Important: string = "";
    static readonly Indent: string = "|   ";
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

interface Config {
    readonly logLevelLimit?: string;
}

const config: Config = {
    // DEBUG: To see the full log, comment out the next line.
    logLevelLimit: LogLevel.Important,
};

run();
