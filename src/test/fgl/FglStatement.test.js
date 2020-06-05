import {ScanNoWhitespace } from "../../main/fgl/FglScanner";
import {ParseStatement   } from "../../main/fgl/FglParser";
import expectAst from './FglAstMatcher';

test('simple assignment', () => {
    const tokens = ScanNoWhitespace({ source: 'i = 1'} );
    expect(tokens).toHaveLength(4); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        statementType: 'assignment',
        lvalue: { identifiers: ['i'] },
        rvalue: { number: '1' }
    });
});

test('full q lvalue  assignment', () => {
    const tokens = ScanNoWhitespace({ source: 'person.vorname = "Bernhard"'} );
    expect(tokens).toHaveLength(6); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        statementType: 'assignment',
        lvalue: { identifiers: ['person','vorname'] },
        rvalue: { string: 'Bernhard' }
    });
});

test('empty block statement', () => {
    const tokens = ScanNoWhitespace( { source: '{ }'});
    expect(tokens).toHaveLength(3); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        statementType: 'block'
    });
});

test('block statement with assignment', () => {
    const tokens = ScanNoWhitespace( { source: '{ i = 1 }'});
    expect(tokens).toHaveLength(6); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        statementType: 'block',
        statements: [
            {
                statementType: 'assignment',
                lvalue: { identifiers: ['i']},
                rvalue: { number: '1'}
            }
        ]
    });
});

test('empty statement', () => {
    const tokens = ScanNoWhitespace( { source: ';'});
    expect(tokens).toHaveLength(2); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        statementType: 'empty'
    });
});

test('if statement w/o else', () => {
    const tokens = ScanNoWhitespace( { source: 'if x < 2 { condition = true }'});
    expect(tokens).toHaveLength(10); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        statementType: 'if',
        ifExpression: {
            binOpIdentifier: '<',
            leftSide: { identifiers: ['x'] },
            rightSide:{ number: '2' }
        },
        ifBranch: {
            statementType: 'block',
            statements: [{
                statementType: 'assignment',
                lvalue: { identifiers: ['condition']},
                rvalue: { booleanValue: true }
            }]
        }
    });
});

test('if statement with else', () => {
    const tokens = ScanNoWhitespace( { source: 'if x < 2 { condition = true } else { condition = false }'});
    expect(tokens).toHaveLength(16); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        statementType: 'if',
        ifExpression: {
            binOpIdentifier: '<',
            leftSide: { identifiers: ['x'] },
            rightSide:{ number: '2' }
        },
        ifBranch: {
            statementType: 'block',
            statements: [{
                statementType: 'assignment',
                lvalue: { identifiers: ['condition']},
                rvalue: { booleanValue: true }
            }]
        },
        elseBranch: {
            statementType: 'block',
            statements: [{
                statementType: 'assignment',
                lvalue: { identifiers: ['condition']},
                rvalue: { booleanValue: false }
            }]
        }
    });
});