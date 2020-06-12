import { Scope, Runtime, Debugger } from '../../main/fgl/FglRuntime'
import { NodeType } from '../../main/fgl/FglAst'


test('basic scope lookup', () => {
   const myScope = new Scope(null);
   myScope.setValue('testString','I am a teststring');
   const testResult = myScope.lookup('testString');
   expect(testResult).toBe('I am a teststring');
});

test('parent scope lookup', () => {
   const myGlobalScope = new Scope(null);
   myGlobalScope.setValue('myGlobalIdentifier', 'myGlobalValue');
   const myLocalScope  = new Scope(myGlobalScope);
   const testResult = myLocalScope.getValue('myGlobalIdentifier');
   expect(testResult).toBe('myGlobalValue');
});

test('parent scope shadowing', () => {
    const myGlobalScope = new Scope(null);
    myGlobalScope.setValue('myGlobalIdentifier', 'myGlobalValue');
    const myLocalScope  = new Scope(myGlobalScope);
    myLocalScope.setValue('myGlobalIdentifier', 'myLocalValue');
    const testResult = myLocalScope.getValue('myGlobalIdentifier');
    expect(testResult).toBe('myLocalValue');
});

test('a short program', () => {
    const runtime = new Runtime();
    runtime.addDebugLine(0, Debugger.Event.AfterStatement,
        (node,scope,result) => {
        if (node.nodeType === NodeType.STATEMENT_BLOCK) {
            expect(scope).toBeDefined();
            expect(scope.lookup('i')).toBe(1);
        }});
    runtime.loadAndRun({source:'{ i = 0 i = i + 1 }'});
 });

test('a do...until program', () => {
    const runtime = new Runtime();
    runtime.addDebugLine(3, Debugger.Event.AfterStatement,
        (node,scope,result) => {
            if (node.nodeType === NodeType.STATEMENT_BLOCK) {
                expect(scope).toBeDefined();
                expect(scope.lookup('i')).toBe(10);
            }});
    runtime.loadAndRun({source:
            '{\r\n' +                                                           // 0000
                '\ti = 0\r\n' +                                                 // 0001
                '\tdo { parentScope.i = parentScope.i + 1 } until i > 9\r\n' +  // 0002
            '}'});                                                              // 0003
});

test('a while program', () => {
    const runtime = new Runtime();
    runtime.addDebugLine(4, Debugger.Event.AfterStatement,
        (node,scope,result) => {
            if (node.nodeType === NodeType.STATEMENT_BLOCK) {
                expect(scope).toBeDefined();
                expect(scope.lookup('i')).toBe(1);
            }});

    runtime.loadAndRun({source:
            '{\r\n' +                                               // 0000
                '\ti = 10\r\n' +                                    // 0001
                '\twhile i > 1\r\n' +                               // 0002
                '\t\t{ parentScope.i = parentScope.i - 1 }\r\n' +   // 0003
            '}'});                                                  // 0004
});

// Debug mode
// Ryzen 3900X X570 64GB: 668ms according to jest
// this seems to be EXTREMLY SLOW
// then again, it's 1 million additions and
//      1 million condition checks
test('simplistic speed test', () => {
    const runtime = new Runtime();
    runtime.loadAndRun({source:
            '{\r\n' +                                                                   // 0000
                '\ti = 0\r\n' +                                                         // 0001
                '\tdo { parentScope.i = parentScope.i + 1 } until i > 1000000\r\n' +    // 0002
            '}'});                                                                      // 0003
});

test('function declaration and invocation test', () => {
   const runtime = new Runtime();
    runtime.addDebugLine(4, Debugger.Event.AfterStatement,
        (node,scope,result) => {
            if (node.nodeType === NodeType.STATEMENT_BLOCK) {
                expect(scope).toBeDefined();
                expect(scope.lookup('plusResult')).toBe(3);
            }});
    /*
     parentScope: the parent scope of the block statement of the function body
     which is the activation record constructed during function invocation
     which is NOT AVAILABLE at the completion of the assignment statement
     but it's parent scope is the global scope
     so scopes are: global -> activation record -> function body block scope
     parent.parent resolves to global which is available for debugging
     */
   runtime.loadAndRun({source:
        '{\r\n' +                                   //0000
        '\tfunction plus ( a , b )\r\n' +           //0001
        '\t\t{ parentScope.parentScope.plusResult = a + b }\r\n' +    //0002
        '\tresult = plus ( 1 , 2)\r\n' +            //0003
        '}'                                         //0004
   });
});