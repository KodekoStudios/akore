use super::lexer::Lexer;
use super::node::Node;
use regex::Match;

#[derive(Debug)]
pub struct Token<'a> {
    pub matched: Match<'a>,
    pub position: (usize, usize),
    pub lexer: &'a Lexer,
    pub input: &'a str,
}

impl<'a> Token<'a> {
    /// Creates a new `Token` instance with the provided lexer, match, and input string.
    ///
    /// # Parameters
    ///
    /// - `lexer`: A reference to the `Lexer` that generated the token.
    /// - `matched`: The regex match that the token represents.
    /// - `input`: The input string that the token was matched against.
    ///
    /// # Returns
    ///
    /// A new `Token` instance with the provided fields.
    pub fn new(lexer: &'a Lexer, matched: Match<'a>, input: &'a str) -> Self {
        let position = Self::get_position(input, matched.start());
        Self {
            matched,
            position,
            lexer,
            input,
        }
    }

    /// Converts the token into a node based on the matched pattern.
    ///
    /// # Returns
    ///
    /// A `Node` representing the node for the token.
    pub fn nodify(&self) -> Node {
        let pattern = self
            .lexer
            .patterns
            .iter()
            .find(|pattern| pattern.matches(self.matched.as_str()))
            .expect("Match does not have a valid pattern!");

        pattern.nodify(self)
    }

    /// Calculates the position (row and column) of a match within the input string.
    ///
    /// # Parameters
    ///
    /// - `input`: A string slice representing the input text where the match was found.
    /// - `start_index`: The starting index of the match within the input string.
    ///
    /// # Returns
    ///
    /// A tuple `(usize, usize)` representing the row and column of the match's starting position.
    pub fn get_position(input: &str, start_index: usize) -> (usize, usize) {
        input[..start_index].chars().fold((1, 1), |(row, col), c| {
            if c == '\n' {
                (row + 1, 1)
            } else {
                (row, col + 1)
            }
        })
    }
}
