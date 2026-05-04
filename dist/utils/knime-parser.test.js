"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knime_parser_1 = require("./knime-parser");
const mockXml = `
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns="http://www.knime.org/2008/09/XMLConfig" key="workflow.knime">
    <entry key="created_by" type="xstring" value="4.7.0.v202211291246"/>
    <entry key="name" type="xstring" value="Test Workflow"/>
    <entry key="author" type="xstring" value="Unit Test"/>
    <config key="nodes">
        <config key="node_1">
            <entry key="id" type="xint" value="1"/>
            <entry key="node_settings_file" type="xstring" value="Table Creator (#1)/settings.xml"/>
        </config>
        <config key="node_2">
            <entry key="id" type="xint" value="2"/>
            <entry key="node_settings_file" type="xstring" value="CSV Reader (#2)/settings.xml"/>
        </config>
    </config>
    <config key="connections">
        <config key="connection_0">
            <entry key="sourceID" type="xint" value="1"/>
            <entry key="destID" type="xint" value="2"/>
        </config>
    </config>
    <config key="annotations">
        <config key="annotation_0">
            <entry key="text" type="xstring" value="Sample Annotation"/>
        </config>
    </config>
    <config key="workflow_variables">
        <config key="variable_0">
            <entry key="name" type="xstring" value="var1"/>
            <entry key="class" type="xstring" value="java.lang.String"/>
            <entry key="value" type="xstring" value="val1"/>
        </config>
    </config>
</config>
`;
describe('KNIME Parser', () => {
    it('should extract basic metadata', () => {
        const metadata = (0, knime_parser_1.parseWorkflowMetadata)(mockXml, 'Fallback');
        expect(metadata.name).toBe('Test Workflow');
        expect(metadata.author).toBe('Unit Test');
        expect(metadata.version).toBe('4.7.0.v202211291246');
    });
    it('should extract nodes correctly', () => {
        const metadata = (0, knime_parser_1.parseWorkflowMetadata)(mockXml, 'Fallback');
        expect(metadata.nodes).toHaveLength(2);
        expect(metadata.nodes[0]).toEqual({ id: '1', name: 'Table Creator' });
        expect(metadata.nodes[1]).toEqual({ id: '2', name: 'CSV Reader' });
    });
    it('should extract connections', () => {
        const metadata = (0, knime_parser_1.parseWorkflowMetadata)(mockXml, 'Fallback');
        expect(metadata.connections).toHaveLength(1);
        expect(metadata.connections[0]).toEqual({ sourceID: '1', destID: '2' });
    });
    it('should extract annotations', () => {
        const metadata = (0, knime_parser_1.parseWorkflowMetadata)(mockXml, 'Fallback');
        expect(metadata.annotations).toContain('Sample Annotation');
    });
    it('should extract workflow variables', () => {
        const metadata = (0, knime_parser_1.parseWorkflowMetadata)(mockXml, 'Fallback');
        expect(metadata.variables).toHaveLength(1);
        expect(metadata.variables[0]).toEqual({ name: 'var1', type: 'String', value: 'val1' });
    });
    it('should handle malformed or missing config', () => {
        const emptyXml = '<config></config>';
        const metadata = (0, knime_parser_1.parseWorkflowMetadata)(emptyXml, 'Fallback');
        expect(metadata.name).toBe('Fallback');
        expect(metadata.nodes).toHaveLength(0);
    });
});
//# sourceMappingURL=knime-parser.test.js.map