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
* [A. Appendix](#a-appendix)
    * [A.1. Sample Data](#a1-sample-data)


## 1. Overview
### 1.1. Conventional SQL
The SQL, set-based, aproach remains the most scalable way to process large data sets known to the industry.
It is the linguistic quircks of the SQL language that have repelled generations of developers. 
For instance, clauses are applied in an order only known to the enlighted.
Also, in order to apply the same operation at multiple stages, statements must be nested instead of simply sequenced.
And on, and on.

### 1.2. `ONESQL`
#### Sequential
The purpose of `ONESQL` is to define an SQL-like language that is as expressive as conventional SQL and that is also intuitive to developers.
A `ONESQL` statement consists of a sequence of stage clauses where a stage clause can be repeated any number of times,
and where the order of the stages is significant.

The following query lists the top 3 states with the largest populations:

```
FROM Demography
GROUP BY State
SELECT State, SUM(Population) AS Population
ORDER BY Population DESC
TAKE 3;
```

__Note__: All examples are based on the sample in [Appendix 1: Sample Data](#a1-sample-data).

#### Independent
Since `ONESQL` is not bound to a particular database system, it can be used as a quiery builder to any such database system.
This specification contains both the input syntax and the output semantic trees.

The output of a `ONESQL` batch is a JSON semantic tree.
JSON is easy to process on any platform, and is easy to ship across nodes. 


## 2. Reference
__Note__: All examples are based on the sample in [Appendix 1: Sample Data](#a1-sample-data).


### 2.1. Batch
Batch is the single top-level concept in `ONESQL`, i.e. the whole input passed into a `ONESQL` compiler is one batch.
A batch consists of a sequence of [statements](#22-statements).

##### SQL Syntax
```
batch ::= 
    | { statement ; }* 
```

##### SQL Example
```
USE Demo;

DELETE FROM Demography
WHERE Population > 2000000;

FROM Demography
WHERE State == 'TX'
ORDER BY Population DESC;
```

##### Semantic Tree
```typescript
interface Batch extends Node {
    readonly statements: Array<Statement>;
}
```


### 2.2. Statements
A statement represents a complete operation of a given kind - query, insert, update, delete.

##### SQL Syntax
```
statement ::=
    | use-statement
    | query-statement
    | insert-statement
    | update-statement
    | delete-statement
```

##### Semantic Tree
```typescript
export interface Statement extends Node {
    readonly statementKind: StatementKind;
}

export enum StatementKind {
    Use,
    Query,
    Insert,
    Update,
    Delete,
}
```


#### 2.2.1. `USE` Statement
The `USE` statement switches the current _database_.
Note that "_database_" may mean different things to different systems.

##### SQL Syntax
```
use-statement ::=
    | USE database-name

database-name ::=
    | identifier 
```

##### SQL Example
```
USE Demo;
```

##### Semantic Tree
```typescript
export interface UseStatement extends Statement {
    readonly databaseName: string;
}
```


#### 2.2.2. Query Statement
The query statementqueries a _source_ from the current database.

##### SQL Syntax
```
query-statement ::= 
    | FROM source-name { query-clause }* ;

source-name ::=
    | identifier 
```

##### SQL Example
```
FROM Demography
WHERE State == 'TX';
```

##### Semantic Tree
```typescript
export interface QueryStatement extends Statement {
    readonly sourceName: string;
    readonly clauses: Array<QueryClause>;
}
```


#### 2.2.2.3. Query Clauses
##### SQL Syntax
```
query-clause ::=
    | where-clause
    | select-clause
    | groupby-clause
    | orderby-clause
```

##### Semantic Tree
```typescript
export interface QueryClause extends Node {
    readonly queryClauseKind: QueryClauseKind;
}

export enum QueryClauseKind {
    Where,
    Select,
    GroupBy,
    OrderBy,
}
```



#### 2.2.2.3.1. `WHERE` Clause
Filters whole items.

##### SQL Syntax
```
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
```

##### SQL Example
```
FROM Demography
WHERE State == 'TX';
```

##### Semantic Tree
```typescript
export interface WhereClause extends QueryClause {
    readonly booleanExpression: Expression;
}
```


#### 2.2.2.3.2. `SELECT` Clause
Projects/reshapes items by removing/adding/renamig properties.

##### SQL Syntax
```
select-clause ::=
    | SELECT projection-list

projection-list ::=
    | projection { , projection }*

projection ::=
    | property-name [ AS identifier ]
    | expression AS identifier
```

##### SQL Example
```
FROM Demography
SELECT City, State, Population / Area AS Density;
```

##### Semantic Tree
```typescript
export interface SelectClause extends QueryClause {
    readonly projections: Array<Projection>;
}

export interface Projection {
    readonly expression: Expression;
    readonly asName: string;
}
```


#### 2.2.2.3.3. `GROUP BY` Clause
Groups items together which allows aggregate functions to be computed over each group.

##### SQL Syntax
```
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
```

##### SQL Example
```
FROM Demography
GROUP BY State
SELECT COUNT(City) AS BigCitiesPerState;
```

##### Semantic Tree
```typescript
export interface GroupByClause extends QueryClause {
    readonly groupings: Array<Grouping>;
    readonly aggregations: Array<Aggregation>;
}

export interface Grouping {
    readonly propertyName: string;
}

export interface Aggregation {
    readonly aggregationExpression: Expression;
    readonly asName: string;
}
```


#### 2.2.2.3.4. `ORDER BY` Clause
Orders items by the values of the specified properties.

##### SQL Syntax
```
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

##### SQL Example
```
FROM Demography
ORDER BY Population DESC;
```

##### Semantic Tree
```typescript
export interface OrderByClause extends QueryClause {
    readonly orderings: Array<Ordering>;
}

export interface Ordering {
    readonly propertyName: string;
    readonly ascending: boolean;
}
```


## A. Appendix
### A.1. Sample Data
The following table, named __Demography__, represents the biggest cities in the United States with their population and land area (in square miles.)

| City          | State | Population | Area  |
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
