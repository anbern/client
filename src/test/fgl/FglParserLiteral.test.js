import { ScanNoWhitespace } from '../../main/fgl/FglScanner';
import { Parse } from '../../main/fgl/FglParser';
import expectAst from './FglAstMatcher';

test('simple number literal',() => {
    const tokens = ScanNoWhitespace({ source: '1'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expectAst(ast).toMatch({ number: '1' });
});

test('simple string literal',() => {
    const tokens = ScanNoWhitespace({ source: '"I am a string"'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expectAst(ast).toMatch({string: 'I am a string'});
});

test('empty string literal',() => {
    const tokens = ScanNoWhitespace({ source: '""'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expectAst(ast).toMatch({string:''});
});

test('true literal',() => {
    const tokens = ScanNoWhitespace({ source: 'true'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expectAst(ast).toMatch({ booleanValue: true });
});

test('false literal',() => {
    const tokens = ScanNoWhitespace({ source: 'false'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expectAst(ast).toMatch({ booleanValue: false });
});

