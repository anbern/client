export class SourceCodeReference {
    constructor(module,
                startPosition, endPosition,
                startLineNumber, endLineNumber,
                startPositionInLine, endPositionInLine) {
        this.module                 = module;
        this.startPosition          = startPosition;
        this.endPosition            = endPosition;
        this.startLineNumber        = startLineNumber;
        this.endLineNumber          = endLineNumber;
        this.startPositionInLine    = startPositionInLine;
        this.endPositionInLine      = endPositionInLine;
    }

    append(other) {
        this.endPosition = other.endPosition;
        this.endLineNumber = other.endLineNumber;
        this.endPositionInLine = other.endPositionInLine;
    }

    prepend(other) {
        this.startPosition = other.startPosition;
        this.startLineNumber = other.startLineNumber;
        this.startPositionInLine = other.startPositionInLine;
    }

    static copy(other) {
        return new SourceCodeReference(
            other.module,
            other.startPosition, other.endPosition,
            other.startLineNumber, other.endLineNumber,
            other.startPositionInLine, other.endPositionInLine
        );
    }


}