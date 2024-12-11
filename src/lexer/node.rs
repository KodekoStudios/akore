use std::{any::Any, collections::HashMap, fmt, sync::Mutex};

#[derive(Debug)]
pub struct NodeManager {
    pub registry: Mutex<HashMap<&'static str, Box<dyn Any + Send>>>,
}

impl NodeManager {
    pub fn new() -> Self {
        Self {
            registry: Mutex::new(HashMap::new()),
        }
    }

    pub fn register<T: 'static + Send>(&self, kind: &'static str, value: T) {
        let mut registry = self.registry.lock().unwrap();
        registry.insert(kind, Box::new(value));
    }

    pub fn create<T: 'static + Send>(&self, kind: &'static str, value: T) -> Option<Node> {
        let registry = self.registry.lock().unwrap();
        if registry.contains_key(kind) {
            Some(Node {
                kind,
                value: Box::new(value),
            })
        } else {
            None // No such node kind in the registry
        }
    }
}

pub struct Node {
    pub kind: &'static str,
    pub value: Box<dyn Any + Send>,
}

impl Node {
    pub fn new(kind: &'static str, value: Box<dyn Any + Send>) -> Self {
        Self { kind, value }
    }

    pub fn value_as<T: 'static>(&self) -> Option<&T> {
        self.value.downcast_ref::<T>()
    }

    pub fn value_as_unknown(&self) -> &dyn Any {
        self.value.as_ref()
    }
}

impl fmt::Debug for Node {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Some(debuggable) = self.value.downcast_ref::<Box<dyn fmt::Debug>>() {
            f.debug_struct("Node")
                .field("kind", &self.kind)
                .field("value", debuggable)
                .finish()
        } else {
            f.debug_struct("Node")
                .field("kind", &self.kind)
                .field("value", &"<not debuggable>")
                .finish()
        }
    }
}
