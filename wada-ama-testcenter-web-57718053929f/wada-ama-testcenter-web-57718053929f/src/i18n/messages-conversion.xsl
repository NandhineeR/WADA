<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" encoding="utf-8" indent="yes"/>

    <xsl:variable name="removeNode">source</xsl:variable>
    <xsl:variable name="renameNode">target</xsl:variable>
    <!-- identity template -->
    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="node()|@*">
        <xsl:if test="not(name()=$removeNode)">
            <xsl:if test="name()=$renameNode">
                <source><xsl:apply-templates select="node()|@*"/></source>
                <xsl:text>&#xa;        </xsl:text>
                <target><xsl:apply-templates select="node()|@*"/></target>
            </xsl:if>
            <xsl:if test="not(name()=$renameNode)">
                <xsl:copy>
                    <xsl:apply-templates select="node()|@*"/>
                </xsl:copy>
            </xsl:if>
        </xsl:if>
    </xsl:template>
    <!-- empty template produces no output for match -->
    <xsl:template match="@source-language"/>
    <xsl:template match="@target-language">
        <xsl:attribute name="source-language">
            <xsl:value-of select="."/>
        </xsl:attribute>
    </xsl:template>

</xsl:stylesheet>
