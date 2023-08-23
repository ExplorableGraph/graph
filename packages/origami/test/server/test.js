// Manual server test runner.

import http from "node:http";
import { requestListener } from "../../src/server/server.js";
import sample from "./sample.js";

const port = 5000;
http.createServer(requestListener(sample)).listen(port);
console.log(`Server running at http://localhost:${port}`);
