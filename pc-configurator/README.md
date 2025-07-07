# PC Configurator

This project is a PC configurator application developed with Vue 3, Pinia, Tailwind CSS, and Vite. It uses a Docker-based backend that includes a JSON-server and an Express proxy to serve PC component data.

## Features
- **Frontend**:
  - Clean and responsive interface.
  - Modularized components.
  - Compatibility alerts, performance estimation, power consumption, and suggestions.
- **Backend**:
  - JSON-server for component data.
  - Express proxy to map endpoints like `/components/:category`.

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-URL>
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Set up Docker:
   - Ensure Docker and Docker Compose are installed.
   - Build and run the containers:
     ```bash
     docker-compose up --build
     ```

## Usage
1. Start the Vite development server:
   ```bash
   npm run dev
   ```
2. Access the application in your browser at `http://localhost:5173`.
3. The backend will be available at `http://localhost:3000`.

## Project Structure
- **src/**: Contains the frontend source code.
  - **components/**: Reusable Vue components.
  - **views/**: Main application views.
  - **store/**: Pinia configuration for global state.
  - **services/**: Services for API calls and compatibility logic.
- **docker/**: Backend-related files.
  - **components.json**: PC component data.
  - **proxy.js**: Express proxy to map endpoints.

## License
This project is licensed under the MIT License.