const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const USER_ID = "abhijeetkumar_05102005";
const EMAIL_ID = "ak9204@srmist.edu.in";
const COLLEGE_ROLL_NUMBER = "RA2311003020147";

function processData(data) {
  const invalidEntries = [];
  const duplicateEdges = [];
  const validEdges = [];
  const seenEdges = new Set();

  const validPattern = /^[A-Z]->[A-Z]$/;

  for (let raw of data) {
    const entry = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    if (!validPattern.test(entry)) {
      invalidEntries.push(raw);
      continue;
    }

    const [parent, child] = entry.split('->');
    if (parent === child) {
      invalidEntries.push(raw);
      continue;
    }

    if (seenEdges.has(entry)) {
      if (!duplicateEdges.includes(entry)) {
        duplicateEdges.push(entry);
      }
      continue;
    }

    seenEdges.add(entry);
    validEdges.push({ parent, child, raw: entry });
  }


  const firstParent = {};
  const children = new Set();
  const allNodes = new Set();
  const adjList = {}; 

  for (const { parent, child } of validEdges) {
    allNodes.add(parent);
    allNodes.add(child);

    if (firstParent[child] === undefined) {
      firstParent[child] = parent;
      children.add(child);
      if (!adjList[parent]) adjList[parent] = [];
      adjList[parent].push(child);
    }

  }


  const roots = [...allNodes].filter(n => !children.has(n)).sort();


  const visited = new Set();
  const components = [];

  const getNeighbors = (node) => {
    const neighbors = [];
    if (adjList[node]) neighbors.push(...adjList[node]);
    // reverse edges
    for (const [p, cs] of Object.entries(adjList)) {
      if (cs.includes(node)) neighbors.push(p);
    }
    return neighbors;
  };

  for (const root of roots) {
    if (visited.has(root)) continue;
    const component = [];
    const stack = [root];
    while (stack.length) {
      const n = stack.pop();
      if (visited.has(n)) continue;
      visited.add(n);
      component.push(n);
      getNeighbors(n).forEach(nb => { if (!visited.has(nb)) stack.push(nb); });
    }
    components.push({ nodes: component, root });
  }


  const unvisited = [...allNodes].filter(n => !visited.has(n));
  if (unvisited.length > 0) {
    const cycleStack = [...unvisited];
    while (cycleStack.length) {
      const start = cycleStack[0];
      if (visited.has(start)) { cycleStack.shift(); continue; }
      const component = [];
      const stack = [start];
      while (stack.length) {
        const n = stack.pop();
        if (visited.has(n)) continue;
        visited.add(n);
        component.push(n);
        getNeighbors(n).forEach(nb => { if (!visited.has(nb)) stack.push(nb); });
      }

      const cycleRoot = component.sort()[0];
      components.push({ nodes: component, root: cycleRoot, forcedRoot: true });
      cycleStack.splice(0, cycleStack.length, ...cycleStack.filter(n => !visited.has(n)));
    }
  }


  const hasCycleInComponent = (nodes) => {
    const nodeSet = new Set(nodes);
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = {};
    nodes.forEach(n => color[n] = WHITE);

    const dfs = (u) => {
      color[u] = GRAY;
      for (const v of (adjList[u] || [])) {
        if (!nodeSet.has(v)) continue;
        if (color[v] === GRAY) return true;
        if (color[v] === WHITE && dfs(v)) return true;
      }
      color[u] = BLACK;
      return false;
    };

    for (const n of nodes) {
      if (color[n] === WHITE && dfs(n)) return true;
    }
    return false;
  };

  const buildTree = (node, visited = new Set()) => {
    if (visited.has(node)) return {};
    visited.add(node);
    const children = adjList[node] || [];
    const subtree = {};
    for (const child of children) {
      subtree[child] = buildTree(child, visited);
    }
    return subtree;
  };

  const getDepth = (node, visited = new Set()) => {
    if (visited.has(node)) return 1;
    visited.add(node);
    const cs = adjList[node] || [];
    if (cs.length === 0) return 1;
    return 1 + Math.max(...cs.map(c => getDepth(c, new Set(visited))));
  };

  const hierarchies = [];

  for (const { nodes, root } of components) {
    const cycle = hasCycleInComponent(nodes);
    if (cycle) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const tree = { [root]: buildTree(root) };
      const depth = getDepth(root);
      hierarchies.push({ root, tree, depth });
    }
  }


  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic = hierarchies.filter(h => h.has_cycle);
  const total_trees = nonCyclic.length;
  const total_cycles = cyclic.length;

  let largest_tree_root = "";
  if (nonCyclic.length > 0) {
    const sorted = nonCyclic.sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root < b.root ? -1 : 1;
    });
    largest_tree_root = sorted[0].root;
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: { total_trees, total_cycles, largest_tree_root }
  };
}

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "'data' must be an array" });
    }
    const result = processData(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

app.get('/', (req, res) => res.json({ status: "BFHL API is running", endpoint: "POST /bfhl" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
