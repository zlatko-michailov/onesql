namespace onesql.semantic {
	export interface Node {
		accept(visitor: Visitor) : any;
	}

	export interface Visitor {
		visit(node: Node) : any;
	}

	export interface Batch extends Node {
		readonly statements: Array<Statement>;
	}

	export interface Statement extends Node {
	}

	export interface UseStatement extends Statement {
		readonly databaseName: string;
	}

	export interface QueryStatement extends Node {
		readonly source: string;
		readonly stages: Array<QueryStage>;
	}

	export interface QueryStage extends Node {
	}
}
