/*
 * Scanning
 */

const TokenType = {
    OpPlus:         'anbern/client/fgl/token/operator/plus',
    OpMinus:        'anbern/client/fgl/token/operator/minus',
    OpTimes:        'anbern/client/fgl/token/operator/times',
    OpDivide:       'anbern/client/fgl/token/operator/divide',
    OpRemainder:    'anbern/client/fgl/token/operator/remainder',
    OpLT:           'anbern/client/fgl/token/operator/less-than',
    OpLE:           'anbern/client/fgl/token/operator/less-equal',
    OpEQ:           'anbern/client/fgl/token/operator/equal',
    OpGE:           'anbern/client/fgl/token/operator/greater-equal',
    OpGT:           'anbern/client/fgl/token/operator/greater-than',
    OpNot:          'anbern/client/fgl/token/operator/not',
    OpAnd:          'anbern/client/fgl/token/operator/and',
    OpOr:           'anbern/client/fgl/token/operator/or',
    KeyIf:          'anbern/client/fgl/token/keyword/if',
    KeyThen:        'anbern/client/fgl/token/keyword/then',
    KeyElse:        'anbern/client/fgl/token/keyword/else',
    KeyDo:          'anbern/client/fgl/token/keyword/do',
    KeyWhile:       'anbern/client/fgl/token/keyword/while',
    KeyUntil:       'anbern/client/fgl/token/keyword/until',
    KeyModule:      'anbern/client/fgl/token/keyword/module,',
    KeyMajor:       'anbern/client/fgl/token/keyword/major',
    KeyMinor:       'anbern/client/fgl/token/keyword/minor',
    KeyPatch:       'anbern/client/fgl/token/keyword/patch',
    KeyDepends:     'anbern/client/fgl/token/keyword/depends',
    Identifier:     'anbern/client/fgl/token/identifier',
    StringLiteral:  'anbern/client/fgl/token/literal/string',
    NumberLiteral:  'anbern/client/fgl/token/literal/number',
    BoolLiteral:    'anbern/client/fgl/token/literal/bool'
}

class SourceLocation {
    constructor(fglModule, lineNumber, fromPosition, toPosition) {
        this.fglModule      = fglModule;
        this.lineNumber     = lineNumber;
        this.fromPosition   = fromPosition;
        this.toPosition     = toPosition;
    }
}

class Token {
    constructor(tokenType, sourceLocation, lexxem) {
        this.tokenType = tokenType;
        this.sourceLocation = sourceLocation;
        this.lexxem = lexxem;
    }
}

class SourceNotification {
    constructor(sourceLocation, message) {
        this.sourceLocation = sourceLocation;
        this.message = message;
    }
}

class Classifier {
    constructor() {
        this.elements = [];
    }
    addElement(element) {
        this.elements.push(element);
    }
    getElementAt(index) {
        return this.elements[index];
    }
}


/*
 * Module System
 */

class FglModule {

    constructor(uri,source) {
        this.source = source;
        const sourceNotifications = [];
        this.tokens = this.scan(this.source, sourceNotifications);
        this.ast    = this.parse(this.tokens, sourceNotifications);
        this.sourceNotifications = sourceNotifications;
        this.uri    = uri;
        this.classifier   = this.deriveClassifierFromUri(uri);
    }

    deriveClassifierFromUri(uri) {
        const classifier = new Classifier();
        classifier.addElement('Test');
        return classifier;
    }

    scan(source,sourceNotifications) {
        return [];
    }

    parse(tokens, sourceNotification) {
        return {};
    }
}

class FglModuleRegistry {

    load(uri) {
        const source        = FglRuntime.loadSourceFromUri(uri);
        const newFglModule  = new FglModule(uri,source);
        this[newFglModule.classifier] = newFglModule;
    }
}

/*
 * Runtime
 */

const FglRuntime = {
    fglModuleRegistry: new FglModuleRegistry(),
    loadSourceFromUri: function(uri) {
        return 'Test';
    }
}



