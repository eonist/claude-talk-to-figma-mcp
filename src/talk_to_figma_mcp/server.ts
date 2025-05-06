#!/usr/bin/env node

import { initializeServer } from "./bootstrap.js";

initializeServer().catch((error) => {
  // If logger is not yet available, fallback to console
  console.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
