//import { Token } from './FglScanner';

class AstNode {}

class ParentAstNode extends AstNode {
    constructor() {
        super();
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
    }
}
export class BlockStatementNode extends ParentAstNode {
}
export class AssignmentStatementNode extends ParentAstNode {
}
export class IfStatementNode extends ParentAstNode {
    constructor(ifExpression) {
        super();
        this.ifExpression = ifExpression;
    }
}
export class WhileStatementNode extends ParentAstNode {
    constructor(whileExpression) {
        super();
        this.whileExpression = whileExpression;
    }
}
export class UntilStatementNode extends ParentAstNode {
    constructor(untilExpression) {
        super();
        this.untilExpression = untilExpression;
    }
}

export class EmptyStatementNode extends AstNode {
}

export class QIdentifierNode extends ParentAstNode {
}

export class FunctionInvocationNode extends ParentAstNode {
    constructor(identifier) {
        super();
        this.identifier = identifier;
    }
}

class LiteralNode extends AstNode {
    constructor(token) {
        super();
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
