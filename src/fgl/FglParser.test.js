import { ScanNoWhitespace, Token } from './FglScanner';
import { Parse, NumberLiteralNode, FunctionInvocationNode } from './FglParser';

test('simple number literal',() => {
    const tokens = ScanNoWhitespace({ source: '1'} );
    expect(tokens.length).toBe(2);
    //console.log(tokens);
    const ast = Parse(tokens);
    console.log('simple number literal test: ast=');
    printAstNode(0,ast);

})

test('simple multiplication',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3'} );
    expect(tokens.length).toBe(4); //including EOF
    //console.log(tokens);
    const ast = Parse(tokens);
    console.log('simple multiplication test: ast=');
    printAstNode(0,ast);
})

test('combined multiplication / division ',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 / 4'} );
    expect(tokens.length).toBe(6); //including EOF
    //console.log(tokens);
    const ast = Parse(tokens);
    console.log('combined multiplication / division test: ast=');
    printAstNode(0,ast);
})

/*
 * Helper Functions
 */
function printAstNode(level, astNode) {
    if (astNode instanceof NumberLiteralNode) {
        console.log(level + ' Number ' + astNode.token.lexxem);
    } else if (astNode instanceof FunctionInvocationNode) {
        console.log(level + ' Invoking ' + astNode.identifier + ' on ');
        astNode.children.forEach(child => printAstNode(level + 1, child));
    } else {
        throw new Error("Miracolous astNode encountered " + astNode);
    }
}
