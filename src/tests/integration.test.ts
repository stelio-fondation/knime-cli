import { execSync } from 'child_process';
import * as path from 'path';

describe('KNIME CLI Integration Tests', () => {
  const cli = 'node dist/index.js';
  const samplesPath = path.resolve(__dirname, '../../samples');

  test('should display help', () => {
    const output = execSync(`${cli} --help`).toString();
    expect(output).toContain('Usage: knime [options]');
  });

  test('should list workflows', () => {
    const output = execSync(`${cli} list -p "${samplesPath}"`).toString();
    expect(output).toContain('KNIME_project');
    expect(output).toContain('wf_simple');
  });

  test('should show info for wf_simple', () => {
    const output = execSync(`${cli} info -w wf_simple -p "${samplesPath}"`).toString();
    expect(output).toContain('Simple Workflow Example');
    expect(output).toContain('CSV Reader');
  });

  test('should show lineage for wf_simple', () => {
    const output = execSync(`${cli} lineage -w wf_simple -p "${samplesPath}"`).toString();
    expect(output).toContain('📊 Lignage des données pour : Simple Workflow Example');
    expect(output).toContain('Table Creator (1) --> Excel Writer (3)');
  });

  test('should generate diff report', () => {
    const output = execSync(`${cli} diff --w1 wf_simple --w2 KNIME_project --p1 "${samplesPath}" --p2 "${samplesPath}"`).toString();
    expect(output).toContain('Comparing workflows...');
  });
});
