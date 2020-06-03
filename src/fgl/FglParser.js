import { Token, SourceCodeReference } from './FglScanner';
import { FunctionInvocationNode, NumberLiteralNode } from './FglAst';

const Runtime = {
    knownFunctionIdentifiers: ['*', '/'],
    knownFunctionIdentifiersLevels: [
        ['*','/'],
        ['+', '-'],
        ['>','>=','=','^=','<=','<'],
        ['&','|']
    ]
};

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        //before begin
        this.currentPosition = -1;
        this.maxPosition = tokens.length - 1;
    }

    parseInfixFunctionInvocationLevel(level) {
        //console.log('parseInfixfunctionInvocation at level ' + level);
        const leftNode = (level >= 0 ? this.parseInfixFunctionInvocationLevel(level -1 )
                                      //end of prioritized binary operators
                                      : this.parseNumberLiteral());
        if (level === -1) {
            //console.log("Level -1 returns " + leftNode.token.lexxem);
            return leftNode;
        }
        //console.log('trying to parse rest at level ' + level);
        const infixFunctionInvocationRest = this.parseInfixFunctionInvocationRestLevel(level);
        if (infixFunctionInvocationRest === null) {
            //console.log('parsing rest at level ' + level + ' rendered null');
            //console.log('level ' + level + ' returns a left node');
            return leftNode;
        }
        const functionInvocationNode = new FunctionInvocationNode(
            infixFunctionInvocationRest.operatorToken.lexxem
        );
        functionInvocationNode.addChild(leftNode);
        functionInvocationNode.addChild(infixFunctionInvocationRest.rightSide);
        return functionInvocationNode;
    }

    parseInfixFunctionInvocationRestLevel(level) {
        //console.log('rest level ' + level + ' checking for operator in ' + Runtime.knownFunctionIdentifiersLevels[level]);
        const operatorToken = this.peek();
        if (!operatorToken.isIdentifier() ||
            (   //operatorToken.isIdentifier &&
                !Runtime.knownFunctionIdentifiersLevels[level].includes(operatorToken.lexxem))) {
            //console.log('not found, parsing rest at level ' + level + ' returns null');
            return null;
        }

        this.consumeToken();
        //console.log('...success, operator found at level ' + level);
        const rightSide = this.parseInfixFunctionInvocationLevel(level);
        //console.log(' rest at level ' + level + ' returns ' + operatorToken.lexxem + ' right ast= ' + rightSide);
        return {
            operatorToken: operatorToken,
            rightSide: rightSide
        };
    }

    parseNumberLiteral() {
        //console.log('parsing number literal...');
        const nextToken = this.peek();
        if (nextToken.isNumberLiteral()) {
            this.consumeToken();
            //console.log('success parsing number literal ' + nextToken.lexxem);
            return new NumberLiteralNode(nextToken);
        }
        return null;
    }

    /*
     * Helper methods
     */
    peek() {
        // The scanner puts EOF token at position maxPosition
        if (this.currentPosition <= this.maxPosition) {
            return this.tokens[this.currentPosition + 1]
        } else {
            return this.tokens[this.maxPosition];
        }
    }

    consumeToken() {
        if (this.currentPosition < this.maxPosition) {
            this.currentPosition = this.currentPosition + 1;
        }
    }
}

export function Parse(tokens) {
    const parser = new Parser(tokens);
    return parser.parseInfixFunctionInvocationLevel(3);
}

