use crate::lexer::lexer::Lexer;

pub struct Transpiler {
    pub lexer: Lexer,
    transpile: fn(t: &Transpiler, input: &str) -> Result<String, String>,
}

impl Transpiler {
    pub fn new(transpile: fn(t: &Transpiler, input: &str) -> Result<String, String>) -> Self {
        Self {
            lexer: Lexer::new(),
            transpile,
        }
    }

    pub fn transpile(&self, input: &str) -> Result<String, String> {
        (self.transpile)(self, input)
    }
}
