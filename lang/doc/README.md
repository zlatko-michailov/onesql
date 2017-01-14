# `ONESQL` Language Reference

* [1. Overview](#1-overview)
    * [1.1. Conventional SQL](#11-conventional-sql)
    * [1.2. `ONESQL`](#12-onesql)
        * [1.2.1. Sequential](#121-sequential)
        * [1.2.2. Independent](#122-independent)
* [2. Reference](#2-reference)
    * [2.1. Batch](#21-batch)
        * [2.1.1. SQL Syntax](#211-sql-syntax)
        * [2.1.2. Semantic Tree](#212-semantic-tree)
    * [2.2. Statements](#22-statements)
        * [2.2.1. `USE` Statement](#221-use-statement)
            * [2.2.1.1. SQL Syntax](#2211-sql-syntax)
            * [2.2.1.2. Semantic Tree](#2212-semantic-tree)
        * [2.2.2. Query Statement](#222-query-statement)
            * [2.2.2.1. SQL Syntax](#2221-sql-syntax)
            * [2.2.2.2. Semantic Tree](#2222-query-semantic)
            * [2.2.2.3. Query Clauses](#2223-query-clauses)
                * [2.2.2.3.1. `WHERE` Clause](#22231-where-clause)
                    * [2.2.2.3.1.1. SQL Syntax](#222311-sql-syntax)
                    * [2.2.2.3.1.2. Semantic Tree](#222312-semantic-tree)
                * [2.2.2.3.2. `SELECT` clause](#22232-select-clause)
                    * [2.2.2.3.2.1. SQL Syntax](#222321-sql-syntax)
                    * [2.2.2.3.2.2. Semantic Tree](#222322-semantic-tree)
                * [2.2.2.3.3. `GROUP` Clause](#22233-group-clause)
                    * [2.2.2.3.3.1. SQL Syntax](#222331-sql-syntax)
                    * [2.2.2.3.3.2. Semantic Tree](#222332-semantic-tree)
                * [2.2.2.3.4. `ORDER` Clause](#22234-order-clause)
                    * [2.2.2.3.4.1. SQL Syntax](#222341-sql-syntax)
                    * [2.2.2.3.4.2. Semantic Tree](#222342-semantic-tree)
        * [2.2.3. `INSERT` Statement](#223-insert-statement)
            * [2.2.3.1. SQL Syntax](#2231-sql-syntax)
            * [2.2.3.2. Semantic Tree](#2232-semantic-tree)
        * [2.2.4. `DELETE` Statement](#224-delete-statement)
            * [2.2.4.1. SQL Syntax](#2241-sql-syntax)
            * [2.2.4.2. Semantic Tree](#2242-semantic-tree)
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
#### 1.2.1. Sequential
The purpose of `ONESQL` is to define an SQL-like language that is as expressive as conventional SQL and that is also intuitive to developers.
A `ONESQL` statement consists of a sequence of stage clauses where a stage clause can be repeated any number of times,
and where the order of the stages is significant.

The following query lists the top 3 states with the largest populations:

```sql
FROM Demography
GROUP BY State
SELECT State, SUM(Population) AS Population
ORDER BY Population DESC
TAKE 3;
```

__Note__: All examples are based on the sample in [Appendix 1: Sample Data](#a1-sample-data).

#### 1.2.2. Independent
Since `ONESQL` is not bound to a particular database system, it can be used as a quiery builder to any such database system.
This specification contains both the input syntax and the output semantic trees.

The output of a `ONESQL` batch is a JSON semantic tree.
JSON is easy to process on any platform, and is easy to ship across nodes. 


## 2. Reference
__Note__: All examples are based on the sample in [Appendix 1: Sample Data](#a1-sample-data).


### 2.1. Batch
Batch is the single top-level concept in `ONESQL`, i.e. the whole input passed into a `ONESQL` compiler is one batch.
A batch consists of a sequence of [statements](#22-statements).

#### 2.1.1. SQL Syntax
```abnf
batch ::= 
    | { statement }* 
```

#### 2.1.2. Semantic Tree
```typescript
interface Batch extends Node {
    readonly statements: Array<Statement>;
}
```


### 2.2. Statements
A statement represents a complete operation of a given kind - query, insert, update, delete.

#### 2.1.1. SQL Syntax
```abnf
statement ::=
    | use-statement
    | query-statement
    | insert-statement
    | update-statement
    | delete-statement
```

#### 2.1.2. Semantic Tree
```typescript
???
```


#### 2.2.1. `USE` Statement
Switches the current _database_.
Note that "_database_" may mean different things to different systems.

#### 2.2.1.1. SQL Syntax
```abnf
use-statement ::=
    | USE database-name ;

database-name ::=
    | identifier 
```

#### 2.2.1.2. Semantic Tree
```typescript
interface Batch extends Node {
    readonly statements: Array<Statement>;
}
```


#### 2.2.2. Query Statement
Queries a _source_ of the current database.

#### 2.2.2.1. SQL Syntax
```abnf
query-statement ::= 
    | FROM source-name { stage-clause }* ;

source-name ::=
    | identifier 
```

#### 2.2.2.2. Semantic Tree
```typescript
???
```


#### 2.2.2.3. Query Clauses
#### 2.2.2.3.1. `WHERE` Clause
Filters whole items.

#### 2.2.2.3.1.1. SQL Syntax
```abnf
where-clause ::= 
    | WHERE boolean-expression

boolean-expression ::=
    | boolean-term [ boolean-binary-operation boolean-expression ]

boolean-term ::=
    | boolean-unary-operation boolean-term
    | ( boolean-expression )
    | boolean-literal
    | comparison-expression

boolean-binary-operation ::=
    | AND
    | &&
    | OR
    | ||

boolean-unary-operation ::= 
    | NOT
    | !

boolean-literal ::= 
    | TRUE
    | FALSE

comparison-expression ::= 
    | arithmetic-expression comparison-operation arithmetic-expression

comparison-operation ::=
    | ==
    | !=
    | <>
    | <
    | <=
    | >
    | >=

arithmetic-expression ::=
    | bitwise-expression

bitwise-expression ::=
    | bitwise-term [ bitwise-binary-operation bitwise-expression ]

bitwise-term ::=
    | bitwise-unary-operation bitwise-term
    | ( arithmetic-expression )
    | addsub-expression

bitwise-binary-operation ::=
    | &
    | |
    | ^

bitwise-unary-operation ::=
    | ~

addsub-expression ::=
    | addsub-term [ addsub-binary-operation addsub-expression ]

addsub-term ::=
    | addsub-unary-operation addsub-expression
    | ( arithmetic-expression )
    | muldiv-expression

addsub-binary-operation ::=
    | +
    | -

addsub-unary-operation ::=
    | +
    | -
    
muldiv-expression ::=
    | muldiv-term [ muldiv-binary-operation muldiv-expression ]

muldiv-term ::=
    | ( arithmetic-expression )
    | number-literal
    | property-name
    | function-call

muldiv-binary-operation ::=
    | *
    | /
    | %

property-name ::=
    | identifier

function-call ::=
    | function-name ( [ expression { , expression }* ] )

function-name ::=
    | identifier

expression ::=
    | boolean-expression
    | arithmetic-expression
    | string-expression
    
string-expression ::=
    | string-term [ string-binary-operation string-expression ]

string-binary-operation ::=
    | +

string-term ::=
    | ( string-expression )
    | string-literal
    | property-name
    | function-call

string-literal ::=
    | " {.}* "
    | ' {.}* '
```

#### 2.2.2.3.1.2. Semantic Tree
```typescript
???
```


#### 2.2.2.3.2. `SELECT` Clause
Projects/reshapes items by removing/adding/renamig properties.

#### 2.2.2.3.2.1. SQL Syntax
```abnf
select-clause ::=
    | SELECT projection { , projection }*

projection ::=
    | property-name [ AS identifier ]
    | expression AS identifier
```

#### 2.2.2.3.2.2. Semantic Tree
```typescript
???
```


#### 2.2.2.3.3. `GROUP` Clause
Groups items together which allows aggregate functions to be computed over each group.

#### 2.2.2.3.3.1. SQL Syntax
```abnf
group-clause ::=
    | GROUP BY property-name { , property-name }* select-clause
```

#### 2.2.2.3.3.2. Semantic Tree
```typescript
???
```


#### 2.2.2.3.4. `ORDER` Clause
Orders items by the values of the specified properties.

#### 2.2.2.3.4.1. SQL Syntax
```abnf
order-clause ::=
    | ORDER BY property-name [ order-direction ] { , property-name [ order-direction ] }*

order-direction ::=
    | ASC
    | DESC
```

#### 2.2.2.3.4.2. Semantic Tree
```typescript
???
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
