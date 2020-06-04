import { ScanNoWhitespace } from '../../main/fgl/FglScanner';
import { Parse } from '../../main/fgl/FglParser';

test('simple number literal',() => {
    const tokens = ScanNoWhitespace({ source: '1'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expect(ast).toMatchObject({
        token: {
            lexxem: '1'
        }
    });
    expect(ast.value).toBe(1)
});

test('simple string literal',() => {
    const tokens = ScanNoWhitespace({ source: '"I am a string"'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expect(ast).toMatchObject({
        token: {
            //lexxem includes "..."
            lexxem: '"I am a string"'
        }
    });
    //value does not include "..."
    expect(ast.value).toBe('I am a string');
});

test('empty string literal',() => {
    const tokens = ScanNoWhitespace({ source: '""'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expect(ast).toMatchObject({
        token: {
            //lexxem includes "..."
            lexxem: '""'
        }
    });
    //value does not include "..."
    expect(ast.value).toBe('');
});

test('true literal',() => {
    const tokens = ScanNoWhitespace({ source: 'true'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expect(ast).toMatchObject({
        token: {
            //lexxem includes "..."
            lexxem: 'true'
        }
    });
    //value does not include "..."
    expect(ast.value).toBe(true);
});

test('false literal',() => {
    const tokens = ScanNoWhitespace({ source: 'false'} );
    expect(tokens).toHaveLength(2);
    const ast = Parse(tokens);
    expect(ast).toMatchObject({
        token: {
            //lexxem includes "..."
            lexxem: 'false'
        }
    });
    //value does not include "..."
    expect(ast.value).toBe(false);
});

