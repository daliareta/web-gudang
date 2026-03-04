# GudangSWY - ISP Inventory Management System

A specialized inventory management system designed for ISPs (Internet Service Providers) and WiFi Partners. Built with React, Tailwind CSS, Express, and SQLite.

## Features

- **ISP-Focused Categories**: Pre-configured categories for Active Devices (Modems, Routers), Fiber Optics, Passive Devices, Tools, and Installation Materials.
- **Serial Number (SN) Tracking**: Track individual devices by their unique serial numbers.
- **Inventory Management**: Add, edit, and delete items with SKU, location, and minimum stock alerts.
- **Transaction History**: Log incoming and outgoing stock with notes.
- **Dashboard Overview**: Quick stats on total items, stock levels, and low-stock alerts.
- **Modern UI**: Dark-themed, responsive interface built with Tailwind CSS.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Node.js, Express.
- **Database**: SQLite (via `better-sqlite3`).

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd gudangswy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file based on `.env.example`.

4. Start the development server:
   ```bash
   npm run dev
   ```

## License

MIT
