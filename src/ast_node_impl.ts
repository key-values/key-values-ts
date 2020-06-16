import { ASTNode, StringASTNode, NumberASTNode, ObjectASTNode, PropertyASTNode, ValueASTNode, KeyASTNode } from "./ast_node";

export abstract class ASTNodeImpl {
    public readonly abstract type: 'object' | 'property' | 'array' | 'string' | 'number';

    public offset: number;
    public length: number;
    public parent: ASTNode | undefined;

    constructor(parent: ASTNode | undefined, offset: number, length: number = 0) {
        this.offset = offset;
        this.length = length;
        this.parent = parent;
    }

    public get children(): ASTNode[] {
        return [];
    }

    public toString(): string {
        const parentStr = this.parent ? ` parent: {${this.parent.toString()}}`: '';
        return `type: ${this.type} (${this.offset}/${this.length})${parentStr}`
    }
}

export class StringASTNodeImpl extends ASTNodeImpl implements StringASTNode {
    public type: 'string' = 'string';
    public isQuoted: boolean;
    public value: string;

    constructor(parent: ASTNode | undefined, strValue: string, offset: number, length?: number) {
        super(parent, offset, length);
        this.value = strValue;
        this.isQuoted = true;
    }
}

export class NumberASTNodeImpl extends ASTNodeImpl implements NumberASTNode {
    public type: 'number' = 'number';
    public isInteger: boolean;
    public isQuoted: boolean;
    public value: number;

    constructor(parent: ASTNode | undefined, numValue: number, offset: number) {
        super(parent, offset);
        this.isInteger = true;
        this.isQuoted = true;
        this.value = numValue;
    }
}

export class PropertyASTNodeImpl extends ASTNodeImpl implements PropertyASTNode {
    public type: 'property' = 'property';
    public keyNode: KeyASTNode;
    public valueNode: ValueASTNode;
    
    constructor(parent: ObjectASTNode | undefined, keyNode: KeyASTNode, valueNode: ValueASTNode, offset: number, length?: number) {
        super(parent, offset, length);
        this.keyNode = keyNode;
        this.valueNode = valueNode;
    }
}

export class ObjectASTNodeImpl extends ASTNodeImpl implements ObjectASTNode {
    public type: 'object' = 'object';
    public properties: PropertyASTNode[];

    constructor(parent: ASTNode | undefined, properties: PropertyASTNode[], offset: number, length?: number) {
        super(parent, offset, length);
        this.properties = properties;
    }

    public get children(): ASTNode[] {
        return this.properties;
    }
}
