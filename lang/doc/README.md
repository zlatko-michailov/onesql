# `ONESQL` Language Reference

* [1. Overview](#1-overview)
    * [1.1. Conventional SQL](#11-conventional-sql)
    * [1.2. `ONESQL`](#12-onesql)
* [2. Reference](#2-reference)
    * [2.1. Batch](#21-batch)
    * [2.2. Statements](#22-statements)
        * [2.2.1. `USE` Statement](#221-use-statement)
        * [2.2.2. Query Statement](#222-query-statement)
            * [2.2.2.3. Query Clauses](#2223-query-clauses)
                * [2.2.2.3.1. `WHERE` Clause](#22231-where-clause)
                * [2.2.2.3.2. `SELECT` clause](#22232-select-clause)
                * [2.2.2.3.3. `GROUP BY` Clause](#22233-group-by-clause)
                * [2.2.2.3.4. `ORDER BY` Clause](#22234-order-by-clause)
        * [2.2.3. `INSERT` Statement](#223-insert-statement)
        * [2.2.4. `DELETE` Statement](#224-delete-statement)
    * [2.3. Built-In Functions and Operations](#23-built-in-functions-and-operations)
    * [2.4. Case-Sensitivity](#24-case-sensitivity)
    * [2.5. Parsing a Semantic Tree](#25-parsing-a-semantic-tree)
* [A. Appendix](#a-appendix)
    * [A.1. Sample Data](#a1-sample-data)
    * [A.2. SQL Syntax BNF](#a2-sql-syntax-bnf)


## 1. Overview
### 1.1. Conventional SQL
The SQL-based, set-based, aproach remains the most scalable way to process large data sets known to the industry.
It is the linguistic quircks of the SQL language that have been repelling generations of developers. 
For instance, SQL clauses are applied in an order only known to the enlighted.
Also, in order to apply the same operation at multiple stages, statements must be nested instead of simply sequenced.
And on, and on.

### 1.2. `ONESQL`
#### Sequential
The purpose of `ONESQL` is to define a SQL-like language that is as expressive as conventional SQL but that is also intuitive to developers.
A `ONESQL` statement consists of a sequence of stage clauses where a stage clause can be repeated any number of times,
and where stages are applied in order of appearance.

The following query lists the top 3 states with the largest populations:

```
FROM demography
GROUP BY state
SELECT state, SUM(population) AS population
ORDER BY population DESC
TAKE 3;
```

__Note__: All examples are based on the sample in [Appendix 1: Sample Data](#a1-sample-data).

#### Independent
Since `ONESQL` is not bound to a particular database system, it can be used as a quiery builder for any such database system.
This specification contains both the input (SQL) syntax and the output semantic trees.

The output of a `ONESQL` batch is a JSON semantic tree.
JSON is easy to process on any platform, and is easy to ship across nodes. 


## 2. Reference
__Note__: All examples are based on the sample in [Appendix 1: Sample Data](#a1-sample-data).


### 2.1. Batch
Batch is the single top-level concept in `ONESQL`, i.e. the whole input passed into a `ONESQL` compiler is one batch.
A batch consists of a sequence of [statements](#22-statements).
Each statement must be terminated by a semicolon `;`.

##### SQL Example
```
USE onesqlTest;

DELETE FROM demography
WHERE population > 2000000;

FROM demography
WHERE state == 'TX'
ORDER BY population DESC;
```

##### Semantic Tree
```typescript
export interface Batch extends Node {
    readonly statements: ReadonlyArray<Statement>;
}

export interface Node {
	readonly nodeKind: NodeKind;
}

export const enum NodeKind {
	Batch = 1,
    ...
}
```


### 2.2. Statements
A statement represents a complete operation of a given kind - query, insert, update, delete.


#### 2.2.1. `USE` Statement
The `USE` statement switches the current _database_.
Note that "_database_" may mean different things to different systems.

##### SQL Syntax
USE database-name;

##### SQL Example
```
USE onesqlTest;
```

##### Semantic Tree
```typescript
export interface UseStatement extends Statement {
    readonly databaseName: string;
}

export interface Statement extends Node {
	readonly statementKind: StatementKind;
}

export interface Node {
	readonly nodeKind: NodeKind;
}

export const enum NodeKind {
    ...
	Statement = 2,
    ...
}

export const enum StatementKind {
	Use = 1,
    ...
}
```


#### 2.2.2. Query Statement
The query statement queries a _source_ from the current database.

##### SQL Syntax
```
FROM source-name
[ query-clauses ];
```

##### SQL Example
```
FROM demography
WHERE state == 'TX'
ORDER BY popoulation DESC;
```

##### Semantic Tree
```typescript
export interface QueryStatement extends Statement {
    readonly sourceName: string;
    readonly clauses: ReadonlyArray<QueryClause>;
}

export interface Statement extends Node {
	readonly statementKind: StatementKind;
}

export interface Node {
	readonly nodeKind: NodeKind;
}

export const enum NodeKind {
    ...
	Statement = 2,
    ...
}

export const enum StatementKind {
	...
	Query = 2,
	...
}
```


#### 2.2.2.3. Query Clauses
`ONESQL` query clauses have a similar syntax and meaning as in conventional SQL.
However, unlike in conventional SQL, `ONESQL` query clauses are applied in order of appearance.
This crates a comprehensible mechanism for _pipelining_ query clauses in a comprehensible way. 


#### 2.2.2.3.1. `WHERE` Clause
Filters whole items.

##### SQL Example
```
FROM demography
WHERE state == 'TX' OR state == 'CA';
```

##### Semantic Tree
```typescript
export interface WhereClause extends QueryClause {
	readonly condition: Expression;
}

export interface QueryClause extends Node {
    readonly queryClauseKind: QueryClauseKind;
}

export const enum NodeKind {
    ...
	QueryClause = 3,
    ...
}

export const enum QueryClauseKind {
	Where = 1,
    ...
}
```


#### 2.2.2.3.2. `SELECT` Clause
__Note:__ This feature is not yet implemented.

Projects/reshapes items by removing/adding/renamig properties.

##### SQL Syntax
```
SELECT expression [ AS identifier ], ...
```

##### SQL Example
```
FROM demography
SELECT city, state, population / area AS density;
```

##### Semantic Tree
```typescript
export interface SelectClause extends QueryClause {
	readonly projections: ReadonlyArray<Projection>;
}

export interface Projection extends Node {
	readonly expression: Expression;
	readonly asName: string;
}

export const enum NodeKind {
    ...
	QueryClause = 3,
    ...
}

export const enum QueryClauseKind {
	...
	Select = 2,
	...
}
```


#### 2.2.2.3.3. `GROUP BY` Clause
__Note:__ This feature is not yet implemented.

Groups items together which allows aggregate functions to be computed over each group.
Grouping properties are automatically projected.

##### SQL Syntax
```
GROUP BY property, ...
SELECT aggregation-expression [ AS identifier ], ...
```

##### SQL Example
```
FROM demography
GROUP BY state
SELECT SUM(population) AS population;
```

##### Semantic Tree
```typescript
export interface GroupByClause extends QueryClause {
	readonly groupings: ReadonlyArray<Grouping>;
	readonly aggregations: ReadonlyArray<Aggregation>;
}

export interface Grouping extends Node {
	readonly propertyName: string;
}

export interface Aggregation extends Node {
	readonly aggregationExpression: Expression;
	readonly asName: string;
}

export const enum NodeKind {
    ...
	QueryClause = 3,
    ...
}

export const enum QueryClauseKind {
	...
	GroupBy = 3,
	...
}
```


#### 2.2.2.3.4. `ORDER BY` Clause
Orders items by the values of the specified properties.

##### SQL Syntax
```
ORDER BY property [ ASC | DESC ], ...
```

##### SQL Example
```
FROM demography
ORDER BY population DESC;
```

##### Semantic Tree
```typescript
export interface OrderByClause extends QueryClause {
	readonly orderings: ReadonlyArray<Ordering>;
}

export interface Ordering extends Node {
	readonly propertyName: string;
	readonly ascending: boolean;
}

export const enum NodeKind {
    ...
	QueryClause = 3,
    ...
}

export const enum QueryClauseKind {
	...
	OrderBy = 4,
    ...
}
```


#### 2.2.3. `INSERT` Statement
__Note:__ This feature is not yet implemented.


#### 2.2.4. `DELETE` Statement
__Note:__ This feature is not yet implemented.


### 2.3. Built-In Functions and Operations
#### Functions
__Note:__ Not all functions may be supported by a given database system.

| `FunctionSymbol`        | Name           | Arguments                                       | Result type  |
| ----------------        | ----           | ---------                                       | -----------  |
| `Abs` (1)               | `ABS`          | x: `number`                                     | `number`     |
| `Ceil` (2)              | `CEIL`         | x: `number`                                     | `number`     |
| `Exp` (3)               | `EXP`          | x: `number`                                     | `number`     |
| `Floor` (4)             | `FLOOR`        | x: `number`                                     | `number`     |
| `Lg` (5)                | `LG`           | x: `number`                                     | `number`     |
| `Ln` (6)                | `LN`           | x: `number`                                     | `number`     |
| `Log` (7)               | `LOG`          | x: `number`, base: `number`                     | `number`     |
| `Power` (8)             | `POWER`        | x: `number`, power: `number`                    | `number`     |
|                         |                |                                                 |              |
| `IndexOf` (9)           | `INDEXOF`      | str: `string`, sub: `string`                    | `number`     |
| `Length` (10)           | `LENGTH`       | str: `string`                                   | `number`     |
|                         |                |                                                 |              |
| `Day` (11)              | `DAY`          | dt: `datetime`                                  | `number`     |
| `Hours` (12)            | `HOURS`        | dt: `datetime`                                  | `number`     |
| `Milliseconds` (13)     | `MILLISECONDS` | dt: `datetime`                                  | `number`     |
| `Minutes` (14)          | `MINUTES`      | dt: `datetime`                                  | `number`     |
| `Month` (15)            | `MONTH`        | dt: `datetime`                                  | `number`     |
| `Seconds` (16)          | `SECONDS`      | dt: `datetime`                                  | `number`     |
| `Year` (17)             | `YEAR`         | dt: `datetime`                                  | `number`     |
|                         |                |                                                 |              |
| `Substr` (18)           | `SUBSTR`       | str: `string`, start: `number`, count: `number` | `string`     |
| `ToLower` (19)          | `TOLOWER`      | str: `string`                                   | `string`     |
| `ToString` (20)         | `TOSTRING`     | x: `any`                                        | `string`     |
| `ToUpper` (21)          | `TOUPPER`      | str: `string`                                   | `string`     |
|                         |                |                                                 |              |
| `Avg` (22)              | `AVG`          | x: `number`                                     | `number`     |
| `Count` (23)            | `COUNT`        | x: `any`                                        | `number`     |
| `First` (24)            | `FIRST`        | x: `any`                                        | `any`        |
| `Last` (25)             | `LAST`         | x: `any`                                        | `any`        |
| `Max` (26)              | `MAX`          | x: `number`                                     | `number`     |
| `Min` (27)              | `MIN`          | x: `number`                                     | `number`     |
| `Sum` (28)              | `SUM`          | x: `number`                                     | `number`     |
|                         |                |                                                 |              |
| `Now` (29)              | `NOW`          |                                                 | `datetime`   |
| `Today` (30)            | `TODAY`        |                                                 | `datetime`   |


#### Unary Operations
__Note:__ Not all operations may be supported by a given database system.

| `UnaryOperationSymbol`  | Alias(es)      | Argument                                        | Result type  |
| ----------------        | ----           | ---------                                       | -----------  |
| `LogicalNot` (1)        | `NOT`, `!`     | b: `boolean`                                    | `boolean`    |
| `BitwiseNot` (2)        | `~`            | n: `number`                                     | `number`     |
| `NoOp` (3)              | `+`            | n: `number`                                     | `number`     |
| `Negate` (4)            | `-`            | n: `number`                                     | `number`     |


#### Binary Operations
__Note:__ Not all operations may be supported by a given database system.

| Priority | `BinaryOperationSymbol` | Alias(es)      | Arguments                                       | Result type  |
| -------- | ----------------        | ----           | ---------                                       | -----------  |
|  1       | `Multiply` (14)         | `*`            | x: `number`, y: `number`                        | `number`     |
|  1       | `Divide` (15)           | `/`            | x: `number`, y: `number`                        | `number`     |
|  1       | `Modulo` (16)           | `%`            | x: `number`, y: `number`                        | `number`     |
|          |                         |                |                                                 |              |
|  2       | `Add` (12)              | `+`            | x: `number`, y: `number`                        | `number`     |
|  2       | `Subtract` (13)         | `-`            | x: `number`, y: `number`                        | `number`     |
|          |                         |                |                                                 |              |
|  3       | `BitwiseOr` (9)         | `|`            | x: `number`, y: `number`                        | `number`     |
|  3       | `BitwiseAnd` (10)       | `&`            | x: `number`, y: `number`                        | `number`     |
|  3       | `BitwiseXor` (11)       | `^`            | x: `number`, y: `number`                        | `number`     |
|          |                         |                |                                                 |              |
|  4       | `DateTimeAdd` (18)      | `+`            | x: `datetime`, y: `number`                      | `datetime`   |
|  4       | `DateTimeSubtract` (19) | `-`            | x: `datetime`, y: `number`                      | `datetime`   |
|  4       | `DateTimeDiff` (20)     | `-`            | x: `datetime`, y: `datetime`                    | `number`     |
|          |                         |                |                                                 |              |
|  5       | `Concat` (17)           | `+`            | x: `string`, y: `string`                        | `string`     |
|          |                         |                |                                                 |              |
|  6       | `Equal` (3)             | `=`, `==`      | x: `any`, y: `any`                              | `boolean`    |
|  6       | `NotEqual` (4)          | `!=`           | x: `any`, y: `any`                              | `boolean`    |
|  6       | `Less` (5)              | `<`            | x: `any`, y: `any`                              | `boolean`    |
|  6       | `LessOrEqual` (6)       | `<=`           | x: `any`, y: `any`                              | `boolean`    |
|  6       | `Greater` (7)           | `>`            | x: `any`, y: `any`                              | `boolean`    |
|  6       | `GreaterOrEqual` (6)    | `>=`           | x: `any`, y: `any`                              | `boolean`    |
|          |                         |                |                                                 |              |
|  7       | `LogicalAnd` (2)        | `AND`, `&&`    | x: `any`, y: `any`                              | `boolean`    |
|  7       | `LogicalOr` (1)         | `OR`, `||`     | x: `any`, y: `any`                              | `boolean`    |


### 2.4. Case-Sensitivity
The `ONESQL` language is case-insensitive, i.e. you can spell language constructs - keywords and built-in functions - in any way.
However, databases, sources, and properties may be part of a case-sensitive backend database system. __MongoDB__ is such a case-sensitve database system.
That's why database contructs - database, source, and properties - should be spelled exactly as they are definied in the database system


### 2.5. Parsing a Semantic Tree
All the semantic tree definitions are in module [../src/onesql.semantic.ts](../src/onesql.semantic.ts).

For an example on how to traverse a semantic batch, see [../src/onesql.gen.mongo.ts](../src/onesql.gen.mongo.ts).


## A. Appendix
### A.1. Sample Data
The following table, named __demography__, represents the biggest cities in the United States with their population and land area (in square miles.)

| city          | state | population | area  |
| ----          | ----- | ---------- | ----  |
| New York      | NY    |  8,555,405 | 302.6 |
| Los Angles    | CA    |  3,971,883 | 467.8 |
| Chicago       | IL    |  2,720,546 | 227.6 |
| Houston       | TX    |  2,296,224 | 599.6 |
| Philadelphia  | PA    |  1,567,442 | 134.1 |
| Phoenix       | AZ    |  1,563,025 | 516.7 |
| San Antonio   | TX    |  1,469,845 | 460.9 |
| San Diego     | CA    |  1,394,928 | 325.2 |
| Dallas        | TX    |  1,300,092 | 340.5 |
| San Jose      | CA    |  1,026,908 | 176.6 |
| Austin        | TX    |    931,830 | 322.5 |
| Jacksonville  | FL    |    868,031 | 747.0 |
| San Francisco | CA    |    864,816 |  46.9 |


### A.2. SQL Syntax BNF
```
batch ::= 
    | { statement ; }* 

statement ::=
    | use-statement
    | query-statement
    | insert-statement
    | update-statement
    | delete-statement

use-statement ::=
    | USE database-name

database-name ::=
    | identifier 

query-statement ::= 
    | FROM source-name { query-clause }* ;

source-name ::=
    | identifier 

query-clause ::=
    | where-clause
    | select-clause
    | groupby-clause
    | orderby-clause

where-clause ::= 
    | WHERE boolean-expression

boolean-expression ::=
    | boolean-term [ binary-boolean-operation boolean-expression ]

boolean-term ::=
    | unary-boolean-operation boolean-term
    | ( boolean-expression )
    | boolean-literal
    | property-name
    | comparison-expression

binary-boolean-operation ::=
    | AND
    | &&
    | OR
    | ||

unary-boolean-operation ::= 
    | NOT
    | !

boolean-literal ::= 
    | TRUE
    | FALSE

comparison-expression ::= 
    | expression comparison-operation expression

comparison-operation ::=
    | ==
    | !=
    | <>
    | <
    | <=
    | >
    | >=

expression ::=
    | boolean-expression
    | arithmetic-expression
    | bitwise-expression
    | string-expression
    | datetime-expression

arithmetic-expression ::=
    | bitwise-expression

bitwise-expression ::=
    | bitwise-term [ binary-bitwise-operation bitwise-expression ]

bitwise-term ::=
    | unary-bitwise-operation bitwise-term
    | ( arithmetic-expression )
    | addsub-expression
    | datetime-diff-expression

binary-bitwise-operation ::=
    | &
    | |
    | ^
    | <<
    | >>

unary-bitwise-operation ::=
    | ~

addsub-expression ::=
    | addsub-term [ binary-addsub-operation addsub-expression ]

addsub-term ::=
    | unary-addsub-operation addsub-term
    | ( arithmetic-expression )
    | muldiv-expression

binary-addsub-operation ::=
    | +
    | -

unary-addsub-operation ::=
    | +
    | -
    
muldiv-expression ::=
    | muldiv-term [ binary-muldiv-operation muldiv-expression ]

muldiv-term ::=
    | ( arithmetic-expression )
    | number-literal
    | property-name
    | arithmetic-function-call

binary-muldiv-operation ::=
    | *
    | /
    | %

property-name ::=
    | identifier

arithmetic-function-call ::=
    | arithmetic-function ( [ expression { , expression }* ] )

arithmetic-function ::=
    | ABS
    | POWER
    | EXP 
    | FLOOR
    | CEIL
    | LN
    | LOG
    | LG
    |
    | LEN
    | INDEXOF
    |
    | YEAR
    | MONTH
    | DAY
    | HOURS
    | MINUTES
    | SECONDS
    | MILLISECONDS

string-expression ::=
    | string-term [ binary-string-operation string-expression ]

binary-string-operation ::=
    | +

string-term ::=
    | ( string-expression )
    | string-literal
    | property-name
    | string-function-call

string-literal ::=
    | " {.}* "
    | ' {.}* '

string-function-call ::=
    | string-function ( [ expression { , expression }* ] )

string-function ::=
    | SUBSTR
    | TOLOWER
    | TOUPPER
    | TOSTRING

datetime-diff-expression ::=
    | datetime-term [ diff-datetime-operation datetime-expression ]

diff-datetime-operation ::=
    | -

datetime-expression ::=
    | datetime-term [ binary-datetime-operation arithmetic-expression ]

binary-datetime-operation ::=
    | +
    | -

datetime-term ::=
    | ( datetime-expression )
    | datetime-literal
    | property-name
    | datetime-function-call

datetime-literal ::=
    | DATETIME 'simplified-iso-datetime'
    | DATETIME "simplified-iso-datetime"

simplified-iso-datetime ::=
    | yyyy - mm - dd [ T hh : mm : ss [ . nnn ] [ Z ] ]  

datetime-function-call ::=
    | datetime-function ( [ expression { , expression }* ] )

datetime-function ::=
    | NOW

select-clause ::=
    | SELECT projection-list

projection-list ::=
    | projection { , projection }*

projection ::=
    | property-name [ AS identifier ]
    | expression AS identifier

groupby-clause ::=
    | GROUP BY grouping-list aggregation-select-clause

grouping-list ::=
    | property { , property }*

aggregation-select-clause ::=
    | SELECT aggregation-list

aggregation-list ::=
    | aggregation { , aggregation }*

aggregation ::=
    | aggregation-function-call AS identifier

aggregation-function-call ::=
    | aggregation-function ( [ expression { , expression }* ] )

aggregation-function ::=
    | COUNT
    | SUM
    | AVG
    | MIN
    | MAX
    | FIRST
    | LAST

orderby-clause ::=
    | ORDER BY ordering-list

ordering-list ::=
    | ordering { , ordering }*

ordering ::=
    | property-name [ order-direction ]

order-direction ::=
    | ASC
    | DESC
```
