use super::{node::Node, token::Token};
use regex::Regex;
use std::sync::Arc;

#[derive(Debug)]
/// Represents a resolver that matches input against a regex pattern and converts tokens to nodes.
///
/// # Fields
///
/// * `matcher` - An `Arc<Regex>` that holds the compiled regular expression pattern.
/// * `nodifier` - A function that converts a `Token` into a `Node`.
pub struct Resolver {
    pub matcher: Arc<Regex>,
    pub nodifier: fn(&Token) -> Node,
}

impl Resolver {
    /// Creates a new `Resolver` instance with the specified regex pattern and nodifier function.
    ///
    /// # Parameters
    ///
    /// * `pattern` - A string slice that holds the regex pattern to be compiled.
    /// * `nodifier` - A function that takes a reference to a `Token` and returns a `Node`.
    ///
    /// # Returns
    ///
    /// A `Resolver` instance with the compiled regex pattern and the provided nodifier function.
    pub fn new(pattern: &str, nodifier: fn(&Token) -> Node) -> Self {
        Self {
            matcher: Arc::new(Regex::new(pattern).expect("Invalid regex pattern")),
            nodifier,
        }
    }

    /// Converts a `Token` into a `Node` using the resolver's nodifier function.
    ///
    /// # Parameters
    ///
    /// * `input` - A reference to a `Token` that will be converted into a `Node`.
    ///
    /// # Returns
    ///
    /// A `Node` that is the result of applying the nodifier function to the input `Token`.
    pub fn nodify(&self, input: &Token) -> Node {
        (self.nodifier)(input)
    }

    /// Checks if the input string matches the resolver's regex pattern.
    ///
    /// # Parameters
    ///
    /// * `input` - A string slice that will be tested against the resolver's regex pattern.
    ///
    /// # Returns
    ///
    /// A boolean value indicating whether the input string matches the regex pattern (`true`) or not (`false`).
    pub fn matches(&self, input: &str) -> bool {
        self.matcher.is_match(input)
    }
}
