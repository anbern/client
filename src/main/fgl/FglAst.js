export const NodeType = {
    STATEMENT_FUNCTION_DECLARATION:
                            'STATEMENT_FUNCTION_DECLARATION',
    STATEMENT_FUNCTION_PARAMETER_LIST:
                            'STATEMENT_FUNCTION_PARAMETER_LIST',
    STATEMENT_EMPTY:        'STATEMENT_EMPTY',
    STATEMENT_BLOCK:        'STATEMENT_BLOCK',
    STATEMENT_ASSIGNMENT:   'STATEMENT_ASSIGNMENT',
    STATEMENT_IF:           'STATEMENT_IF',
    STATEMENT_WHILE:        'STATEMENT_WHILE',
    STATEMENT_UNTIL:        'STATEMENT_UNTIL',
    EXPRESSION_QIDENTIFIER: 'EXPRESSION_QIDENTIFIER',
    EXPRESSION_FUNCTIONINVOCATION:
                            'EXPRESSION_FUNCTIONINVOCATION',
    EXPRESSION_LITERAL_NUMBER:
                            'EXPRESSION_LITERAL_NUMBER',
    EXPRESSION_LITERAL_STRING:
                            'EXPRESSION_LITERAL_STRING',
    EXPRESSION_LITERAL_BOOLEANVALUE:
                            'EXPRESSION_LITERAL_BOOLEANVALUE',
    EXPRESSION_PARAM_EXPRESSION_LIST:
                            'EXPRESSION_PARAM_EXPRESSION_LIST'

}
class AstNode {
    constructor(sourceCodeReference, nodeType) {
        this.sourceCodeReference = sourceCodeReference;
        this.nodeType = nodeType;
    }
}

class ParentAstNode extends AstNode {
    constructor(sourceCodeReference, nodeType) {
        super(sourceCodeReference, nodeType);
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
    }
}

export class FunctionDeclarationStatementNode extends ParentAstNode {
    constructor(sourceCodeReference, functionName, functionBody) {
        super(sourceCodeReference, NodeType.STATEMENT_FUNCTION_DECLARATION);
        this.functionName = functionName;
        this.functionBody = functionBody;
    }
}

export class EmptyStatementNode extends AstNode {
    constructor(sourceCodeReference) {
        super(sourceCodeReference, NodeType.STATEMENT_EMPTY);
    }
}

export class BlockStatementNode extends ParentAstNode {
    constructor(sourceCodeReference) {
        super(sourceCodeReference, NodeType.STATEMENT_BLOCK);
    }
}

export class FunctionParameterListNode extends ParentAstNode {
    constructor(sourceCodeReference) {
        super(sourceCodeReference, NodeType.STATEMENT_FUNCTION_PARAMETER_LIST)
    }
}

export class ParamExpressionListNode extends ParentAstNode {
    constructor(sourceCodeReference) {
        super(sourceCodeReference, NodeType.EXPRESSION_PARAM_EXPRESSION_LIST)
    }
}
export class AssignmentStatementNode extends ParentAstNode {
    constructor(sourceCodeReference) {
        super(sourceCodeReference, NodeType.STATEMENT_ASSIGNMENT);
    }
}

export class IfStatementNode extends ParentAstNode {
    constructor(sourceCodeReference, ifExpression) {
        super(sourceCodeReference, NodeType.STATEMENT_IF);
        this.ifExpression = ifExpression;
    }
}
export class WhileStatementNode extends ParentAstNode {
    constructor(sourceCodeReference, whileExpression) {
        super(sourceCodeReference, NodeType.STATEMENT_WHILE);
        this.whileExpression = whileExpression;
    }
}
export class UntilStatementNode extends ParentAstNode {
    constructor(sourceCodeReference, untilExpression) {
        super(sourceCodeReference, NodeType.STATEMENT_UNTIL);
        this.untilExpression = untilExpression;
    }
}

export class QIdentifierNode extends ParentAstNode {
    constructor(sourceCodeReference) {
        super(sourceCodeReference,NodeType.EXPRESSION_QIDENTIFIER);
    }
}

export class FunctionInvocationNode extends ParentAstNode {
    constructor(sourceCodeReference, operatorIdentifier) {
        super(sourceCodeReference, NodeType.EXPRESSION_FUNCTIONINVOCATION);
        this.operatorIdentifier = operatorIdentifier;
    }
}

class LiteralNode extends AstNode {
    constructor(token,nodetype) {
        super(token.sourceCodeReference, nodetype);
        this.token = token;
    }
}

export class NumberLiteralNode extends LiteralNode {
    constructor(token) {
        super(token, NodeType.EXPRESSION_LITERAL_NUMBER);
        this.value = parseInt(token.lexxem,10);
        if (isNaN(this.value)) {
            throw new Error('Invalid 10 baseed number lexxem: ' + token.lexxem);
        }
    }
}

export class StringLiteralNode extends LiteralNode {
    constructor(token) {
        super(token, NodeType.EXPRESSION_LITERAL_STRING);
        //remove the leading and trailing "
        this.value = token.lexxem.slice(1,-1);
    }
}

export class BooleanLiteralNode extends LiteralNode {
    constructor(token) {
        super(token, NodeType.EXPRESSION_LITERAL_BOOLEANVALUE);
        if (token.lexxem === 'true') {
            this.value = true;
        } else if (token.lexxem === 'false') {
            this.value = false;
        }
    }
}
