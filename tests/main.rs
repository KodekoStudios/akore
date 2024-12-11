use akore::{core::transpiler::Transpiler, lexer::{lexer::LexerFlags, resolver::Resolver}};

#[test]
fn main() {
    let mut transpiler = Transpiler::new(|t, input| {
        let mut program = Vec::<String>::new();

        for token in t.lexer.tokenize(input) {
            match token {
                Ok(token) => {
                    let node = token.nodify();
                    match node.kind {
                        "string" => {
                            program.push(format!("\"{}\"", node.value_as::<String>().unwrap()));
                        }

                        "integer" => {
                            program.push(format!("{}", node.value_as::<i32>().unwrap()));
                        }

                        _ => {
                            return Err(format!("Unhandled node kind: {:?}", node.kind));
                        }
                    }
                }

                Err(gap) => {
                    return Err(format!("Unexpected token: {gap}"));
                }
            }
        }

        let mut transpiled = program.join(";\n");
        transpiled.push(';');
        
        Ok(transpiled)
    });

    transpiler.lexer.flags.add(LexerFlags::FAIL_WHEN_UNMATCH);

    transpiler.lexer.nodes.register("string", String::new());
    transpiler.lexer.nodes.register("integer", 0i32);

    let string_pattern = Resolver::new(r"'[a-z]*'", |token| {
        let matched = token.matched.as_str();
        let content = &matched[1..matched.len()-1];
        token.lexer.nodes.create::<String>("string", content.to_string()).unwrap()
    });

    let int_pattern = Resolver::new(r"\d+", |token| {
        let matched = token.matched.as_str();
        let content = matched.parse::<i32>().unwrap();
        token.lexer.nodes.create::<i32>("integer", content).unwrap()
    });

    transpiler.lexer.add_pattern(string_pattern);
    transpiler.lexer.add_pattern(int_pattern);

    let input = "'hello' 123";
    println!("input: {}", input);

    let transpiled = transpiler.transpile(input);
    match transpiled {
        Ok(output) => println!("{}", output),
        Err(error) => println!("Error: {}", error),
    }
}
