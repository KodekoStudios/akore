use super::{node::NodeManager, resolver::Resolver, token::Token};
use regex::Regex;

#[derive(Debug)]
pub struct LexerFlags(u32);

impl LexerFlags {
    pub const FAIL_WHEN_UNMATCH: u32 = 0b0001;

    pub fn new(flags: u32) -> Self {
        Self(flags)
    }

    pub fn contains(&self, flag: u32) -> bool {
        self.0 & flag == flag
    }

    pub fn add(&mut self, flag: u32) {
        self.0 |= flag;
    }

    pub fn remove(&mut self, flag: u32) {
        self.0 &= !flag;
    }
}

#[derive(Debug)]
/// Represents a lexical analyzer (lexer) for tokenizing input text.
///
/// A `Lexer` contains a collection of patterns (resolvers) used to identify and
/// categorize different parts of the input text into tokens.
///
/// # Fields
///
/// * `patterns`: A vector of `Resolver` instances, each representing a pattern
///   used for token matching.
pub struct Lexer {
    pub patterns: Vec<Resolver>,
    pub nodes: NodeManager,
    pub flags: LexerFlags,
}

impl Lexer {
    /// Creates a new `Lexer` instance with an empty set of patterns.
    ///
    /// # Returns
    ///
    /// A new `Lexer` instance.
    pub fn new() -> Self {
        Self {
            patterns: Vec::new(),
            nodes: NodeManager::new(),
            flags: LexerFlags::new(0),
        }
    }

    /// Tokenizes the input string based on the lexer's patterns.
    ///
    /// # Parameters
    ///
    /// * `input`: A string slice that contains the text to be tokenized.
    ///
    /// # Returns
    ///
    /// An iterator that yields `Token` instances representing the tokens found in the input.
    pub fn tokenize<'a>(&'a self, input: &'a str) -> impl Iterator<Item = Result<Token<'a>, String>> + 'a {
        let pattern = self.merge_patterns();

        let mut start_index = 0;
        let mut last_index: usize = 0;

        std::iter::from_fn(move || {
            pattern.find_at(input, start_index).map(|mat| -> Result<Token<'a>, String> {
                start_index = mat.end();
                let token = Token::new(self, mat, input);

                if self.flags.contains(LexerFlags::FAIL_WHEN_UNMATCH) {
                    let between = input[last_index..mat.start()].trim();
                    if between.is_empty() {
                        last_index = mat.end();
                        Ok(token)
                    } else {
                        Err(between.to_string())
                    }
                } else {
                    Ok(token)
                }
            })
        })
    }

    /// Merges all patterns in the lexer into a single regex pattern.
    ///
    /// # Returns
    ///
    /// A `Regex` instance representing the merged pattern of all resolvers.
    pub fn merge_patterns(&self) -> Regex {
        let merged_pattern = self
            .patterns
            .iter()
            .map(|pattern| format!("(?:{})", pattern.matcher.as_str()))
            .collect::<Vec<_>>()
            .join("|");

        Regex::new(&merged_pattern).expect("Failed to build the merged regex")
    }

    /// Adds a new pattern to the lexer's set of patterns.
    ///
    /// # Parameters
    ///
    /// * `pattern`: A `Resolver` instance representing the pattern to be added.
    pub fn add_pattern(&mut self, pattern: Resolver) {
        self.patterns.push(pattern);
    }
}
