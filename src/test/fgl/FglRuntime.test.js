import { Scope, Runtime } from '../../main/fgl/FglRuntime'


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
    runtime.loadAndRun({source:'{\ti = 0\r\n\ti = i + 1\r\n}'});
 });

test('a do...until program', () => {
    const runtime = new Runtime();
    runtime.loadAndRun({source:
            '{' +
                '\ti = 0\r\n' +
                '\tdo { parentScope.i = parentScope.i + 1 } until i > 9\r\n' +
            '}'});
});

test('a while program', () => {
    const runtime = new Runtime();
    runtime.loadAndRun({source:'{' +
            '\ti = 10\r\n' +
            '\twhile i > 1 { parentScope.i = parentScope.i - 1 }\r\n' +
            '}'});
});