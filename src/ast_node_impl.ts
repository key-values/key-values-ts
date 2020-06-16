import { ASTNode, StringASTNode, NumberASTNode, ObjectASTNode, PropertyASTNode } from "./ast_node";

export abstract class ASTNodeImpl {
    public readonly abstract type: 'object' | 'property' | 'array' | 'string' | 'number';

    public offset: number;
    public length: number;
    public readonly parent: ASTNode | undefined;

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

    constructor(parent: ASTNode | undefined, offset: number, length?: number) {
        super(parent, offset, length);
        this.value = '';
        this.isQuoted = true;
    }
}

export class NumberASTNodeImpl extends ASTNodeImpl implements NumberASTNode {
    public type: 'number' = 'number';
    public isInteger: boolean;
    public isQuoted: boolean;
    public value: number;

    constructor(parent: ASTNode | undefined, offset: number) {
        super(parent, offset);
        this.isInteger = true;
        this.isQuoted = true;
        this.value = Number.NaN
    }
}

export class PropertyASTNodeImpl extends ASTNodeImpl implements PropertyASTNode {
    public type: 'property' = 'property';
    public keyNode: StringASTNode;
    public valueNode?: ASTNode;
    
    constructor(parent: ObjectASTNode | undefined, offset: number, keyNode: StringASTNode) {
        super(parent, offset);
        this.keyNode = keyNode;
    }
}

export class ObjectASTNodeImpl extends ASTNodeImpl implements ObjectASTNode {
    public type: 'object' = 'object';
    public properties: PropertyASTNode[];

    constructor(parent: ASTNode | undefined, offset: number) {
        super(parent, offset);
        this.properties = [];
    }

    public get children(): ASTNode[] {
        return this.properties;
    }
}
