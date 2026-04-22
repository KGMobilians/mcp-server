import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { buildIndex } from "../indexer/doc-indexer.js";
import { registerGetDocsTool } from "../tool/get-docs.js";
import { registerDocumentByIdTool } from "../tool/document-by-id.js";
import { registerGetPaymentApiSpecTool } from "../tool/get-payment-api-spec.js";
import { registerGetPaymentCodeExampleTool } from "../tool/get-payment-code-example.js";
import { registerGetNezoApiSpecTool } from "../tool/get-nezo-api-spec.js";
import { registerGetNezoCodeExampleTool } from "../tool/get-nezo-code-example.js";

let client: Client | null = null;
let server: McpServer | null = null;

export async function getTestClient(): Promise<Client> {
  if (client) return client;

  await buildIndex();

  server = new McpServer({ name: "mobilpay-test", version: "test" });

  registerGetDocsTool(server);
  registerDocumentByIdTool(server);
  registerGetPaymentApiSpecTool(server);
  registerGetPaymentCodeExampleTool(server);
  registerGetNezoApiSpecTool(server);
  registerGetNezoCodeExampleTool(server);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  client = new Client({ name: "test-client", version: "test" });

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return client;
}

export async function cleanupTestClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
  server = null;
}

export async function callTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  const c = await getTestClient();
  const result = await c.callTool({ name, arguments: args });
  const textContent = result.content as Array<{ type: string; text: string }>;
  return textContent.map((c) => c.text).join("\n");
}
