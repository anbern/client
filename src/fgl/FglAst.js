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
    }
}
