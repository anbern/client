import { ScanNoWhitespace } from '../../main/fgl/FglScanner';
//import { FunctionInvocationNode, NumberLiteralNode } from '../../main/fgl/FglAst';
import { Parse } from '../../main/fgl/FglParser';

test('simple number literal',() => {
    const tokens = ScanNoWhitespace({ source: '1'} );
    expect(tokens).toHaveLength(2);
    //console.log(tokens);
    const ast = Parse(tokens);
    //console.log('simple number literal test: ast=');
    //printAstNode(0,ast);
    expect(ast).toMatchObject({
       token: {
           lexxem: '1'
       }
    });

})

test('simple multiplication',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3'} );
    expect(tokens).toHaveLength(4); //including EOF
    //console.log(tokens);
    const ast = Parse(tokens);
    //console.log('simple multiplication test: ast=');
    //printAstNode(0,ast);
    expect(ast).toMatchObject({
       identifier: '*',
    });
    expect(ast.children).toBeDefined();
    expect(ast.children[0]).toMatchObject({token: { lexxem: '2'}});
    expect(ast.children[1]).toMatchObject({token: { lexxem: '3'}});
})

test('combined multiplication / division ',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 / 4'} );
    expect(tokens).toHaveLength(6); //including EOF
    //console.log(tokens);
    const ast = Parse(tokens);
    //console.log('combined multiplication / division test: ast=');
    //printAstNode(0,ast);
    expect(ast).toMatchObject({identifier: '*'});
    expect(ast.children).toBeDefined();
    expect(ast.children).toHaveLength(2);
    const l0left  = ast.children[0];
    const l0right = ast.children[1];

    expect(l0left).toMatchObject({token:{lexxem:'2'}});
    expect(l0right).toMatchObject({identifier:'/'});
    expect(l0right.children).toBeDefined();
    expect(l0right.children).toHaveLength(2);
    const l1left  = l0right.children[0];
    const l1right = l0right.children[1];

    expect(l1left).toMatchObject({token:{lexxem:'3'}});
    expect(l1right).toMatchObject({token:{lexxem:'4'}});

})

test('combined addition and multiplication (* rechts)',() => {
    const tokens = ScanNoWhitespace({ source: '2 + 3 * 4'} );
    expect(tokens.length).toBe(6); //including EOF
    //console.log(tokens);
    const ast = Parse(tokens);
    //console.log('combined addition and multiplication (* rechts) test: ast=');
    //printAstNode(0,ast);
    expect(ast).toMatchObject({identifier: '+'});
    expect(ast.children).toHaveLength(2);
    const l0left = ast.children[0];
    const l0right = ast.children[1];
    expect(l0left).toMatchObject({token:{lexxem:'2'}});
    expect(l0right).toMatchObject({identifier: '*'});
    expect(l0right.children).toHaveLength(2);
    const l1left = l0right.children[0];
    const l1right = l0right.children[1];
    expect(l1left).toMatchObject({token:{lexxem:'3'}});
    expect(l1right).toMatchObject({token:{lexxem:'4'}});
})

test('combined addition and multiplication (+ rechts)',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 + 4'} );
    expect(tokens.length).toBe(6); //including EOF
    //console.log(tokens);
    const ast = Parse(tokens);
    //console.log('combined addition and multiplication (+ rechts) test: ast=');
    //printAstNode(0,ast);
    expect(ast).toMatchObject({identifier: '+'});
    expect(ast.children).toHaveLength(2);
    const l0left = ast.children[0];
    const l0right = ast.children[1];
    expect(l0left).toMatchObject({identifier:'*'});
    expect(l0left.children).toHaveLength(2);
    const l1left = l0left.children[0];
    const l1right = l0left.children[1];
    expect(l1left).toMatchObject({token:{lexxem:'2'}});
    expect(l1right).toMatchObject({token:{lexxem:'3'}});
    expect(l0right).toMatchObject({token:{lexxem:'4'}});
})

test('complex infix',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 > 5 & 4 - 1 ^= 2'} );
    expect(tokens.length).toBe(12); //including EOF
    //console.log(tokens);
    const ast = Parse(tokens);
    //console.log('complex infix 2*3 > 5 & 4-1 ^= 2 test: ast=');
    //printAstNode(0,ast);
    console.log(ast);
})
/*
 * Helper Functions
 */
/*
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
 */
