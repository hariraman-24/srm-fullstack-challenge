# SRM Full Stack Engineering Challenge

A high-performance hierarchy processor built for the SRM Engineering Challenge. This application handles complex string-based node relationships, processes them into trees/cycles, and visualizes them through a premium web interface.

## 🌟 Features

- **Robust Backend**: Node.js/Express API with custom graph algorithms.
- **Tree Construction**: Handles multi-parent (diamond) cases and separates independent components.
- **Cycle Detection**: Identifies cyclic groups and assigns lexicographical roots.
- **Premium UI**: Glassmorphism aesthetic with a recursive tree visualizer.
- **Performance**: Optimized to respond in < 3s for up to 50 nodes.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Vanilla CSS, Outfit Font.
- **Backend**: Node.js, Express, CORS.
- **Deployment**: Vercel (Frontend), Render (Backend).

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/hariraman-24/srm-fullstack-challenge.git
   ```
2. Install Backend dependencies:
   ```bash
   cd backend && npm install
   ```
3. Install Frontend dependencies:
   ```bash
   cd ../frontend && npm install
   ```

### Running Locally
1. Start the Backend:
   ```bash
   cd backend && node index.js
   ```
2. Start the Frontend:
   ```bash
   cd frontend && npm run dev
   ```

## 📝 API Specification (POST /bfhl)

**Input Format**:
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

**Output Components**:
- `hierarchies`: Array of processed tree/cycle objects.
- `invalid_entries`: Strings that don't match the node format.
- `duplicate_edges`: Repeated parent-child pairs.
- `summary`: Counts of trees, cycles, and the largest tree root.

---
**Author**: hariraman_24102005
**College ID**: hr4331@srmist.edu.in
**Roll Number**: RA2311003050215
