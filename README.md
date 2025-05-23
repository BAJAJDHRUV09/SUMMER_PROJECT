# Boundary Layer Visualization

An interactive web application for visualizing boundary layer thickness using React, Vite, and Tailwind CSS.

## Features

- Interactive visualization of boundary layer thickness
- Real-time updates with slider control
- Responsive design
- Fast data rendering using Recharts
- CSV data integration

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Place your `data.csv` file in the `public` directory. The CSV should have the following columns:
   - x: x-coordinate
   - y: y-coordinate
   - u: velocity
   - Re: Reynolds number

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- PapaParse
- Headless UI
