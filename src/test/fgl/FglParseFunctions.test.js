import { ScanNoWhitespace } from '../../main/fgl/FglScanner';
import { ParseExpression } from '../../main/fgl/FglParser';
import expectAst from './FglAstMatcher';


test('simple function invocation',() => {
    const tokens = ScanNoWhitespace({ source: 'f(x)'} );
    expect(tokens).toHaveLength(5); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['f'] },
        parameters: [
            { identifiers: ['x'] }
        ]})
});

test('empty function invocation',() => {
    const tokens = ScanNoWhitespace({ source: 'f( )'} );
    expect(tokens).toHaveLength(4); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['f'] },
        parameters: []
        });
});

test('function invocations of function invocations', () => {
    const tokens = ScanNoWhitespace({ source: 'f ( g ( x ) )'} );
    expect(tokens).toHaveLength(8); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['f'] },
        parameters: [{
            functionName: {identifiers: ['g']},
            parameters: [{identifiers: ['x']}]
        }]});
});

test('function invocations of paren expressions', () => {
    const tokens = ScanNoWhitespace({ source: '+ ( 3 * ( 4 + 5 ) )'} );
    expect(tokens).toHaveLength(11); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['+'] },
        parameters: [{
            functionName: {identifiers: ['*']},
            parameters: [
                { number: '3' },
                {  functionName: { identifiers: ['+'] },
                   parameters: [
                       { number: '4' },
                       { number: '5'}
            ]}]}]}); //wouldn't lisp be just better?
});
