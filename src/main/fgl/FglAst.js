class AstNode {
    constructor(sourceCodeReference) {
        this.sourceCodeReference = sourceCodeReference;
    }
}

class ParentAstNode extends AstNode {
    constructor(sourceCodeReference) {
        super(sourceCodeReference);
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
    }
}

export class EmptyStatementNode extends AstNode {
}

export class BlockStatementNode extends ParentAstNode {
}

export class AssignmentStatementNode extends ParentAstNode {
}

export class IfStatementNode extends ParentAstNode {
    constructor(sourceCodeReference, ifExpression) {
        super(sourceCodeReference);
        this.ifExpression = ifExpression;
    }
}
export class WhileStatementNode extends ParentAstNode {
    constructor(sourceCodeReference, whileExpression) {
        super(sourceCodeReference);
        this.whileExpression = whileExpression;
    }
}
export class UntilStatementNode extends ParentAstNode {
    constructor(sourceCodeReference, untilExpression) {
        super(sourceCodeReference );
        this.untilExpression = untilExpression;
    }
}

export class QIdentifierNode extends ParentAstNode {
}

export class FunctionInvocationNode extends ParentAstNode {
    constructor(sourceCodeReference, binOpIdentifier) {
        super(sourceCodeReference);
        this.binOpIdentifier = binOpIdentifier;
    }
}

class LiteralNode extends AstNode {
    constructor(token) {
        super(token.sourceCodeReference);
        this.token = token;
    }
}

export class NumberLiteralNode extends LiteralNode {
    constructor(token) {
        super(token);
        this.value = parseInt(token.lexxem,10);
        if (isNaN(this.value)) {
            throw new Error('Invalid 10 baseed number lexxem: ' + token.lexxem);
        }
    }
}

export class StringLiteralNode extends LiteralNode {
    constructor(token) {
        super(token);
        //remove the leading and trailing "
        this.value = token.lexxem.slice(1,-1);
    }
}

export class BooleanLiteralNode extends LiteralNode {
    constructor(token) {
        super(token);
        if (token.lexxem === 'true') {
            this.value = true;
        } else if (token.lexxem === 'false') {
            this.value = false;
        }
    }
}
