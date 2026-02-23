/**
 * Generate JSON Schema from Zod command definitions.
 *
 * Usage: npx tsx scripts/generate-schema.ts
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ScenarioCommandSchema } from '../src/commands/commands.ts';
import { fileURLToPath } from 'node:url';

const schema = ScenarioCommandSchema.toJSONSchema();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = join(__dirname, '../commands.schema.json');

writeFileSync(outputPath, `${JSON.stringify(schema, null, 2)}\n`);
console.log(`Schema written to ${outputPath}`);
