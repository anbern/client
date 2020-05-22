import {Scanner} from './fgl.mjs';

/*
 * Identifiers
 */
function testIdentifier() {
    const scanner = new Scanner('IamATest');
    const scannerResult = scanner.scanKeywordOrIdentifier();
    console.log('scannerResult = >' + scannerResult + '<');
    if (scannerResult !== 'IamATest') throw new Error('testIdentifer failed');
}

function testIdentifierWS() {
    const scanner = new Scanner('IamATestWithWhitespace ');
    const scannerResult = scanner.scanKeywordOrIdentifier();
    console.log('scannerResult = >' + scannerResult + '<');
    if (scannerResult !== 'IamATestWithWhitespace') throw new Error('testIdentiferWS failed');
}

function testIdentifierBracket() {
    const scanner = new Scanner('IamATestWithBracket[]');
    const scannerResult = scanner.scanKeywordOrIdentifier();
    console.log('scannerResult = >' + scannerResult + '<');
    if (scannerResult !== 'IamATestWithBracket') throw new Error('testIdentiferBracket failed');
}

function testIdentifierDot() {
    const scanner = new Scanner('IamATestWithADot.com');
    const scannerResult = scanner.scanKeywordOrIdentifier();
    console.log('scannerResult = >' + scannerResult + '<');
    if (scannerResult !== 'IamATestWithADot') throw new Error('testIdentiferDot failed');
}

function testStrangeIdentifier() {
    const scanner = new Scanner('<=#=> (FacingPropellerAircraftOperator)');
    const scannerResult = scanner.scanKeywordOrIdentifier();
    console.log('scannerResult = >' + scannerResult + '<');
    if (scannerResult !== '<=#=>') throw new Error('testStrangeIdentifier failed');
}

function testIdentifierSuite() {
    testIdentifier();
    testIdentifierWS();
    testIdentifierBracket();
    testIdentifierDot();
    testStrangeIdentifier();
}

/*
 * Numbers
 */
function testNumber1() {
    const scanner = new Scanner('1');
    const scannerResult = scanner.scanNumberLiteral();
    console.log('scannerResult = >' + scannerResult + '<');
    if (scannerResult !== '1') throw new Error('testNumber1 failed');
}

function testNumber10() {
    const scanner = new Scanner('10');
    const scannerResult = scanner.scanNumberLiteral();
    console.log('scannerResult = >' + scannerResult + '<');
    if (scannerResult !== '10') throw new Error('testNumber10 failed');
}

function testNumber9Dot9() {
    const scanner = new Scanner('9.9');
    const scannerResult = scanner.scanNumberLiteral();
    console.log('scannerResult = >' + scannerResult + '<');
    if (scannerResult !== '9') throw new Error('testNumber9Dot9 failed');
}

function testNumber99Comma9() {
    const scanner = new Scanner('99,9');
    const scannerResult = scanner.scanNumberLiteral();
    console.log('scannerResult = >' + scannerResult + '<');
    if (scannerResult !== '99') throw new Error('testNumber99Comma9 failed');
}

function testNumberSuite() {
    testNumber1();
    testNumber10();
    testNumber9Dot9();
    testNumber99Comma9();
}

/*
 * Real Scan
 */

function testRealScan() {
    const scanner = new Scanner ('if (x > 0) then\n\tprint "GREATER"; \nelse\n\tprint "SMALLER" ;');
    const tokens  = scanner.scan();
    console.log(tokens);
    assertToken('KEYWORD','if',tokens[0]);
    assertToken('WHITESPACE',' ',tokens[1]);
    assertToken('BRACKET','(',tokens[2]);
    assertToken('IDENTIFIER','x',tokens[3]);
    assertToken('WHITESPACE',' ',tokens[4]);
    assertToken('IDENTIFIER','>',tokens[5]);
    assertToken('WHITESPACE',' ',tokens[6]);
    assertToken('NUMBER','0',tokens[7]);
    assertToken('BRACKET',')',tokens[8]);
    assertToken('WHITESPACE',' ',tokens[9]);
    assertToken('KEYWORD','then',tokens[10]);
    assertToken('WHITESPACE','\n\t',tokens[11]);
    assertToken('IDENTIFIER','print',tokens[12]);
    assertToken('WHITESPACE',' ',tokens[13]);
    assertToken('IDENTIFIER','GREATER',tokens[14]);

}

function assertToken(typeName, lexxem, token) {
    if (token.tokenType === typeName &&
        token.lexxem === lexxem) {
        console.log('OK token >' + token.tokenType + ',' + token.lexxem + '<');
    } else {
        console.log('ERROR token >' + token.tokenType + ',' + token.lexxem + '<');
    }
}
/*
 * All Tests
 */

try {
    testIdentifierSuite();
    testNumberSuite();
    testRealScan();
} catch (exception) {
    console.log(exception);
}



