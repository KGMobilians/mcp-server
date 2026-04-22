#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildIndex } from "./indexer/doc-indexer.js";
import { registerGetDocsTool } from "./tool/get-docs.js";
import { registerDocumentByIdTool } from "./tool/document-by-id.js";
import { registerGetPaymentApiSpecTool } from "./tool/get-payment-api-spec.js";
import { registerGetPaymentCodeExampleTool } from "./tool/get-payment-code-example.js";
import { registerGetNezoApiSpecTool } from "./tool/get-nezo-api-spec.js";
import { registerGetNezoCodeExampleTool } from "./tool/get-nezo-code-example.js";

const server = new McpServer({
  name: "mobilpay",
  version: "2.0.2",
});

await buildIndex();

// 공통 Tools
registerGetDocsTool(server);
registerDocumentByIdTool(server);
// MOBILPAY 결제연동 Tools
registerGetPaymentApiSpecTool(server);
registerGetPaymentCodeExampleTool(server);
// 내죠여왕 Tools
registerGetNezoApiSpecTool(server);
registerGetNezoCodeExampleTool(server);

const transport = new StdioServerTransport();
await server.connect(transport);
