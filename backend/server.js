const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

function isValid(edge) {
    if (typeof edge !== "string") return false;
    const trimmed = edge.trim();

    if (!/^[A-Z]->[A-Z]$/.test(trimmed)) return false;

    const [p, c] = trimmed.split("->");
    if (p === c) return false;

    return true;
}

app.post("/bfhl", (req, res) => {
    try {
        const input = req.body.data || [];

        let invalid = [];
        let duplicates = [];
        let seen = new Set();
        let edges = [];

        // Step 1 & 2: validate + remove duplicates
        for (let e of input) {
            if (!isValid(e)) {
                invalid.push(e);
                continue;
            }

            let trimmed = e.trim();

            if (seen.has(trimmed)) {
                if (!duplicates.includes(trimmed)) {
                    duplicates.push(trimmed);
                }
                continue;
            }

            seen.add(trimmed);
            edges.push(trimmed);
        }

        // Build graph
        let graph = {};
        let childrenSet = new Set();
        let nodes = new Set();

        edges.forEach(e => {
            let [p, c] = e.split("->");

            if (!graph[p]) graph[p] = [];
            graph[p].push(c);

            childrenSet.add(c);
            nodes.add(p);
            nodes.add(c);
        });

        // Identify connected components
        function getComponent(start, visited) {
            let stack = [start];
            let component = new Set();

            while (stack.length) {
                let node = stack.pop();
                if (component.has(node)) continue;

                component.add(node);
                visited.add(node);

                for (let nei of graph[node] || []) stack.push(nei);

                for (let parent in graph) {
                    if (graph[parent].includes(node)) stack.push(parent);
                }
            }

            return component;
        }

        let visitedGlobal = new Set();
        let components = [];

        for (let node of nodes) {
            if (!visitedGlobal.has(node)) {
                components.push(getComponent(node, visitedGlobal));
            }
        }

        let hierarchies = [];
        let totalTrees = 0;
        let totalCycles = 0;
        let maxDepth = 0;
        let largestRoot = "";

        function detectCycle(node, visited, stack) {
            if (!visited.has(node)) {
                visited.add(node);
                stack.add(node);

                for (let nei of graph[node] || []) {
                    if (!visited.has(nei) && detectCycle(nei, visited, stack)) return true;
                    else if (stack.has(nei)) return true;
                }
            }
            stack.delete(node);
            return false;
        }

        function buildTree(node, localVisited) {
            let obj = {};
            let maxChildDepth = 0;

            for (let child of graph[node] || []) {
                if (localVisited.has(child)) continue;
                localVisited.add(child);

                let { tree, depth } = buildTree(child, localVisited);
                obj[child] = tree;
                maxChildDepth = Math.max(maxChildDepth, depth);
            }

            return { tree: obj, depth: maxChildDepth + 1 };
        }

        // Process each component
        for (let comp of components) {
            let compNodes = [...comp];

            // Find root in component
            let compChildren = new Set();
            compNodes.forEach(n => {
                (graph[n] || []).forEach(c => compChildren.add(c));
            });

            let roots = compNodes.filter(n => !compChildren.has(n));

            let root;
            if (roots.length === 0) {
                // pure cycle → smallest lexicographic
                root = compNodes.sort()[0];
            } else {
                root = roots.sort()[0];
            }

            let visited = new Set();
            let stack = new Set();

            let hasCycle = detectCycle(root, visited, stack);

            if (hasCycle) {
                totalCycles++;
                hierarchies.push({
                    root,
                    tree: {},
                    has_cycle: true
                });
            } else {
                let { tree, depth } = buildTree(root, new Set([root]));
                totalTrees++;

                if (
                    depth > maxDepth ||
                    (depth === maxDepth && root < largestRoot)
                ) {
                    maxDepth = depth;
                    largestRoot = root;
                }

                hierarchies.push({
                    root,
                    tree: { [root]: tree },
                    depth
                });
            }
        }

        res.json({
            user_id: "hariraman_24102005",
            email_id: "hr4331@srmist.edu.in",
            college_roll_number: "RA2311003050215",
            hierarchies,
            invalid_entries: invalid,
            duplicate_edges: duplicates,
            summary: {
                total_trees: totalTrees,
                total_cycles: totalCycles,
                largest_tree_root: largestRoot
            }
        });

    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.get("/", (req, res) => {
    res.send("BFHL API is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));