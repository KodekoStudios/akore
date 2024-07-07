<img src="https://i.pinimg.com/564x/b4/49/df/b449df8de856cb236711cac127aa7dde.jpg" align="right" height=100 alt="kita ikuyo" />

# Akore

Akore is a powerful transpiler maker for JavaScript/TypeScript, designed to simplify the process of creating custom transpilers. It provides a robust framework for parsing, analyzing, and transforming code, making it easier for developers to build their own language features or compile to different targets.

## Features

- Easy-to-use API for parsing and transforming code.
- Support for both JavaScript and TypeScript.
- Extensible architecture for adding custom language features.

## Table of Contents
- [Akore](#akore)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
  - [Concepts](#concepts)
    - [Schema](#schema)
      - [Overview](#overview)
      - [Purpose](#purpose)
    - [Registry](#registry)
      - [Overview](#overview-1)
      - [Purpose](#purpose-1)
    - [BaseCompetence](#basecompetence)
      - [Overview](#overview-2)
      - [Purpose](#purpose-2)
    - [Node](#node)
      - [Overview](#overview-3)
      - [Purpose](#purpose-3)
    - [Token](#token)
      - [Overview](#overview-4)
      - [Purpose](#purpose-4)
    - [Lexer](#lexer)
      - [Overview](#overview-5)
      - [Purpose](#purpose-5)
    - [BaseTranspiler](#basetranspiler)
      - [Key Features](#key-features)
      - [Role in the Transpilation Process](#role-in-the-transpilation-process)
  - [Contributing](#contributing)
  - [License](#license)


## Getting Started

To get started with Akore, you need to have Node.js (version 16.0.0 or higher) and npm (version 8.0.0 or higher) installed on your machine.

### Installation

Install Akore using npm, pnpm or bun:

```sh
npm install --save-exact akore
pnpm add --save-exact akore
bun add akore
```

## Concepts

### Schema

The `Schema` class, defined in [`src/core/schema.ts`](src/core/schema.ts), is a fundamental part of the system designed to represent and manage data schemas within the application. It provides a structured way to define the shape and constraints of data, ensuring that data conforms to specified formats and rules.

#### Overview

- **Generic Type `Type`:** The `Schema` class is generic, allowing it to be used with various data types. This flexibility ensures that schemas can be defined for a wide range of data structures, from simple types like strings and numbers to complex nested objects.

- **Constructor:** The constructor of the `Schema` class takes two parameters: `identifier` and `schema`. The `identifier` is a string that uniquely identifies the schema, while `schema` is of the generic type `Type` and represents the structure of the data that the schema describes.

- **String Representation:** The `Schema` class provides a `toString` method that returns a string representation of the schema. This method is useful for debugging and logging purposes, as it allows developers to easily inspect the structure and identifier of a schema.

- **Type Checking and Serialization:** While the provided code excerpts do not show methods for type checking or serialization directly, the `Schema` class is typically used in conjunction with other parts of the system, such as a `Registry`, to validate and serialize data according to the defined schemas. This ensures that data is consistent and adheres to the expected formats throughout the application.

#### Purpose

Overall, the `Schema` class plays a crucial role in defining and enforcing data structures within the application, providing a robust mechanism for data validation and serialization. 

### Registry

The `Registry` class, defined in [`src/core/registry.ts`](src/core/registry.ts), is a specialized implementation of JavaScript's `Map` object. It is designed to map schema types, represented by strings, to their corresponding schemas. This mapping facilitates the validation and serialization of nodes based on their types and associated schemas.

#### Overview

- **Generic Type `R`:** The class is generic, with `R` extending `string`. This means that the keys used in the `Registry` must be strings, allowing for a wide range of schema type identifiers.

- **Constructor:** The constructor optionally accepts a record of schema types to their schemas. It initializes the registry with these schemas if provided.

- **`validate` Method:** This method takes a node as an argument and validates it against its corresponding schema. If the node's type has an associated schema in the registry, it uses the schema's `compare` method to validate the node's value. If no schema is found for the node's type, it throws an error.

- **`resolve` Method:** After validating a node, this method serializes it. If the node passes validation, it returns the serialized representation of the node by calling the node's `serialize` method. If the node fails validation, it throws an error.

#### Purpose

The `Registry` class is a crucial part of the system that ensures nodes are correctly validated and serialized according to their types and associated schemas. This mechanism is essential for maintaining data integrity and consistency throughout the application.

### BaseCompetence

The `BaseCompetence` class, as defined in the [`src/core/base.competence.ts`](src/core/base.competence.ts), serves as an abstract foundation for creating specific competences that the lexer can recognize and process. These competences are crucial for the lexical analysis phase, where input strings are tokenized based on defined patterns and rules.

#### Overview

- **Transpiler Association:** Each instance of `BaseCompetence` is tightly coupled with a specific transpiler instance. This design allows competences to leverage transpiler-specific functionalities and ensures that the lexical analysis is aligned with the transpilation process.

- **Identifier:** Every competence must have a unique identifier (`identifier`). This identifier is used to reference the competence within the lexer's competence map, facilitating efficient retrieval and management of competences.

- **Patterns:** competences define a set of patterns (`patterns`) that are used for matching and manipulating strings during the lexical analysis. These patterns are essential for recognizing the structure and elements within the input strings.

- **Eaters:** The `eaters` property specifies which competences should be consumed before (`before`) and after (`after`) the current competence. This mechanism allows for the definition of dependencies and order among competences, enabling complex parsing strategies.

- **Lexical Flags:** competences can also define lexical flags (`flags`) that control the behavior of the tokenizer. These flags, such as `UNSTOPPABLE` and `DIRECT_ENTRY`, provide additional flexibility in how input strings are tokenized and processed.

- **Abstract Methods:** The class includes abstract methods like `resolve`, which must be implemented by subclasses. The `resolve` method is responsible for processing a token and returning a resolved node, which is a critical part of the parsing and transpilation process.

#### Purpose

The `BaseCompetence` class abstracts the common functionalities and properties needed to define competences within the system. By providing a structured way to specify how strings should be tokenized and processed, it plays a pivotal role in the system's ability to perform lexical analysis and transpilation effectively.

### Node

The `Node` class, as defined in [`src/core/node.ts`](src/core/node.ts), represents the fundamental building block for constructing the abstract syntax tree (AST) during the parsing and transpilation process. Each `Node` instance encapsulates a specific piece of syntax or data structure within the source code being transpiled.

#### Overview

- **Generic Type `Type`:** The `Type` property indicates the specific kind of syntax or structure the `Node` represents. It is a string that categorizes the node, making it easier to process and transform during the transpilation phase.

- **Generic Type `Value`:** The `Value` property holds the actual content or data associated with the `Node`. Depending on the node type, this can range from simple data types like strings or numbers to complex structures like arrays or objects of other nodes.

- **Constructor:** The constructor for a `Node` takes two parameters: `type` and `value`. These parameters initialize the node's type and value properties, respectively.

- **Clone:** The `clone` method creates a deep copy of the `Node`, ensuring that modifications to the clone do not affect the original node. This is particularly useful in scenarios where nodes need to be reused or modified without altering the original AST.

- **Serialize:** The `serialize` method is responsible for converting the `Node` back into a string representation. This is a crucial part of the transpilation process, where the transformed AST is outputted as the final transpiled code. The implementation of this method varies depending on the node type and the specific requirements of the transpilation target.

#### Purpose

The `Node` class plays a critical role in the Akore transpiler framework by providing a structured way to represent and manipulate the syntax and data structures encountered during the parsing of source code. By abstracting syntax and data into nodes, the framework facilitates the analysis, transformation, and generation of target code in a flexible and extensible manner.

### Token

The `Token` class, as defined in [`src/core/token.ts`](src/core/token.ts), plays a pivotal role in the lexical analysis phase of the transpilation process. It encapsulates the details of a single token extracted from the source code, providing a structured way to interact with and manipulate these tokens during parsing and transpilation.

#### Overview

- **Transpiler Association:** Each `Token` instance is associated with a specific type of transpiler, indicated by the generic parameter `Transpiler extends BaseTranspiler`. This association ensures that tokens can be processed in a manner that is aware of the specific transpilation context.

- **Positional Information:** The class provides several properties to access the positional information of the token within the source code:
  - `start`: The start index of the token in the source string.
  - `end`: The end index of the token, calculated based on the start index and the length of the token's total string.
  - `line`: The line number where the token is located, useful for error reporting and debugging.
  - `column`: The column number of the token, providing precise location information within its line.

- **Content and Structure:** The `Token` class also offers properties to access the content and structure of the token:
  - `total`: The total string representation of the token, including any nested structures if applicable.
  - `groups`: A record of named groups within the token, allowing for structured parsing of complex tokens.

- **Eated Tokens:** The `Eated` interface, associated with the `Token` class, represents the tokens that have been consumed immediately before and after the current token. This concept is crucial for understanding the context and relationships between tokens in the source code.

#### Purpose

The `Token` class is essential for the lexer's ability to break down the source code into manageable pieces, each represented by a token. By providing detailed information about each token's position, content, and context, the class enables the transpiler to perform sophisticated analysis and transformations on the source code, ultimately facilitating the generation of the target code.

### Lexer

The `Lexer` class is a fundamental component in the Akore transpilation system, designed to tokenize input strings into a sequence of tokens. This process is crucial for the subsequent phases of parsing and transpilation, as it transforms the raw source code into a structured format that can be more easily analyzed and manipulated.

#### Overview

- **Transpiler Association:** The `Lexer` class is generically associated with a specific type of transpiler, indicated by the `Transpiler extends BaseTranspiler` generic parameter. This design allows the lexer to be tightly integrated with the transpiler's specific requirements and capabilities.

- **Competences:** The lexer operates based on a set of [competences](#basecompetence), each defining a specific pattern to match against the input string. These competences enable the lexer to recognize and tokenize a wide variety of language constructs.

- **Regular Expression Matching:** The lexer constructs a regular expression pattern from the competences patterns. This pattern is used to scan the input string and identify matches that correspond to tokens.

- **Token Generation:** For each match found in the input string, the lexer generates a [`Token`](#token) instance. This token encapsulates details about the match, such as the matched string, its position in the input, and the associated competence.

- **Logging:** The lexer utilizes a `Logger` instance to log warnings and other messages. This is particularly useful for debugging and error reporting, as it helps identify issues with the tokenization process.

#### Purpose

The `Lexer` class plays a critical role in the initial stage of the transpilation process. By breaking down the source code into tokens, it lays the groundwork for the more complex tasks of parsing and code generation. The structured representation of the source code as a sequence of tokens enables the transpiler to perform sophisticated analysis and transformations, ultimately facilitating the generation of the target code.

The design of the `Lexer` class, with its focus on flexibility, extensibility, and integration with the transpiler, underscores its importance in the transpilation system. It exemplifies the system's approach to handling the complexities of source code analysis and transformation.

### BaseTranspiler

The `BaseTranspiler` class serves as the foundational component of the transpilation system, providing the core functionality required to transform source code from one language to another. It is an abstract class that outlines the basic structure and operations of a transpiler, requiring specific implementations to define the details of the transpilation process for their respective languages.

#### Key Features

- **Token Synthesis:** The `BaseTranspiler` class is responsible for synthesizing a sequence of tokens into a generator of nodes. This process involves iterating over the tokens, converting each token into a corresponding node, and handling any errors that may arise during this conversion.

- **Node Conversion:** A critical operation defined in the `BaseTranspiler` is the conversion of tokens into nodes (`nodify` method). This conversion is based on the competences associated with each token, which determine how the token is resolved into a node. The resulting node must match the expected schema, ensuring that the transpiled code adheres to the target language's syntax and semantics.

- **Error Handling:** The class includes robust error handling mechanisms to manage issues encountered during the token-to-node conversion process. Errors are logged with detailed information about the token causing the issue, facilitating debugging and error resolution.

- **Extensibility:** As an abstract class, `BaseTranspiler` provides a flexible framework that can be extended to support various source and target languages. Implementations of the class must define specific competences, schemas, and other components necessary for the transpilation process.

- **Integration with Lexer:** The `BaseTranspiler` class is designed to work closely with the `Lexer` class, relying on the lexer to provide the initial sequence of tokens that are then synthesized into nodes. This integration highlights the collaborative nature of the components within the Akore transpilation system.

#### Role in the Transpilation Process

The `BaseTranspiler` class embodies the core logic of the transpilation process, bridging the gap between the lexical analysis performed by the lexer and the final generation of target code. By providing a structured approach to token synthesis and node conversion, it enables the creation of sophisticated transpilers capable of handling complex source code transformations.

The design of the `BaseTranspiler` class, emphasizing modularity, error handling, and integration with other components of the transpilation system, reflects the Akore system's commitment to flexibility and reliability in code analysis and transformation.

## Contributing

If you're interested in contributing to Akore, please check out the repository on GitHub and submit your pull requests or issues:

- Repository: https://github.com/KodekoStudios/akore
- Issues: https://github.com/KodekoStudios/akore/issues

## License
Akore is licensed under the Kodeko Studios Proprietary License. For more information, please see the LICENSE.md file.