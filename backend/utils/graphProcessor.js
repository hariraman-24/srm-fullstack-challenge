/**
 * Core Logic for the BFHL Hierarchy Processor
 * Handles validation, tree construction, cycle detection, and statistics.
 */

const validateNode = (nodeStr) => {
    const trimmed = nodeStr.trim();
    // Pattern: One uppercase letter -> One uppercase letter
    const regex = /^[A-Z]->[A-Z]$/;
    if (!regex.test(trimmed)) return false;
    
    const [p, c] = trimmed.split('->');
    if (p === c) return false; // Self-loops are invalid per rules
    
    return { parent: p, child: c, raw: trimmed };
};

const buildHierarchies = (data) => {
    const invalid_entries = [];
    const duplicate_edges = [];
    const seen_edges = new Set();
    const valid_edges = [];
    
    const childToParent = new Map();
    const allNodes = new Set();

    // 1. Initial Parsing and Filtering
    data.forEach(item => {
        const validated = validateNode(item);
        if (!validated) {
            invalid_entries.push(item);
            return;
        }

        const { parent, child, raw } = validated;
        
        // Check for duplicates (Parent->Child pair)
        if (seen_edges.has(raw)) {
            if (!duplicate_edges.includes(raw)) {
                duplicate_edges.push(raw);
            }
            return;
        }
        seen_edges.add(raw);

        // Multi-parent rule: first encountered parent wins
        if (childToParent.has(child)) {
            // Discard silently as per Page 2, Rule 4
            return;
        }

        childToParent.set(child, parent);
        valid_edges.push({ parent, child });
        allNodes.add(parent);
        allNodes.add(child);
    });

    // 2. Build Adjacency List
    const adj = new Map();
    allNodes.forEach(node => adj.set(node, []));
    valid_edges.forEach(({ parent, child }) => {
        adj.get(parent).push(child);
    });

    // 3. Process Components and Trees
    const hierarchies = [];
    const processed = new Set();

    // Identify roots (nodes with no parents)
    const roots = Array.from(allNodes)
        .filter(node => !childToParent.has(node))
        .sort(); // Lexicographical sort for consistent processing

    const traverse = (u, visitedInBranch, currentTree) => {
        visitedInBranch.add(u);
        processed.add(u);
        
        const children = adj.get(u) || [];
        // Important: children should be sorted lexicographically if required? 
        // Rules don't specify, but for "tree" structure consistency we'll sort them.
        children.sort();

        let maxDepth = 1;
        let hasCycle = false;

        const nodeObj = {};
        for (const v of children) {
            if (visitedInBranch.has(v)) {
                hasCycle = true;
                break;
            }
            
            const result = traverse(v, new Set(visitedInBranch), {});
            if (result.hasCycle) {
                hasCycle = true;
                break;
            }
            nodeObj[v] = result.tree[v];
            maxDepth = Math.max(maxDepth, 1 + result.depth);
        }

        return {
            tree: { [u]: nodeObj },
            depth: maxDepth,
            hasCycle
        };
    };

    // Process from Roots
    roots.forEach(root => {
        const result = traverse(root, new Set(), {});
        if (result.hasCycle) {
            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });
        } else {
            hierarchies.push({
                root,
                tree: result.tree,
                depth: result.depth
            });
        }
    });

    // Process remaining nodes (Pure Cycles)
    const remainingNodes = Array.from(allNodes)
        .filter(n => !processed.has(n))
        .sort();

    while (remainingNodes.length > 0) {
        // Pick lexicographically smallest node from remaining as cycle root
        const root = remainingNodes[0];
        
        // Find all nodes reachable from this cycle root to mark them processed
        const componentNodes = new Set();
        const stack = [root];
        while(stack.length > 0) {
            const curr = stack.pop();
            if (componentNodes.has(curr)) continue;
            componentNodes.add(curr);
            processed.add(curr);
            (adj.get(curr) || []).forEach(child => stack.push(child));
        }

        hierarchies.push({
            root,
            tree: {},
            has_cycle: true
        });

        // Update remaining nodes list
        const updated = remainingNodes.filter(n => !processed.has(n));
        remainingNodes.length = 0;
        remainingNodes.push(...updated);
    }

    // 4. Summarize
    const summary = {
        total_trees: hierarchies.filter(h => !h.has_cycle).length,
        total_cycles: hierarchies.filter(h => h.has_cycle).length,
        largest_tree_root: ""
    };

    // Tiebreaker for largest_tree_root: smallest root label if depths are equal
    const validTrees = hierarchies.filter(h => !h.has_cycle);
    if (validTrees.length > 0) {
        const sortedTrees = validTrees.sort((a, b) => {
            if (b.depth !== a.depth) return b.depth - a.depth;
            return a.root.localeCompare(b.root);
        });
        summary.largest_tree_root = sortedTrees[0].root;
    }

    // Sort hierarchies for final response consistency? (Usually good practice)
    // We'll sort by root name.
    hierarchies.sort((a, b) => a.root.localeCompare(b.root));

    return {
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary
    };
};

module.exports = { buildHierarchies };
