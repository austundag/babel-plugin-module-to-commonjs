export default function esmToCommon({ types: t }) {
    return {
        visitor: {
            Program(path) {
                const directives = path.node.directives;
                if (!directives) {
                    directives = [];
                    path.node.directives = directives;
                }
                const dl = t.directiveLiteral('use strict');
                dl.extra = { raw: '\'use strict\';', rawValue: 'use strict' };
                directives.push(dl);
            },
            ImportDeclaration(path) {
                const { node: { specifiers, source } } = path;
                const specifier = specifiers[0];

                const id = specifier.local;

                const callee = t.Identifier('require');
                const ce = t.callExpression(callee, [source]);

                const declarator = t.variableDeclarator(id, ce);

                const declaration = t.variableDeclaration('const', [declarator]);

                path.replaceWith(declaration);
            },
            ExportDefaultDeclaration(path) {
                const m = t.identifier('module');
                const e = t.identifier('exports');
                const left = t.memberExpression(m, e);

                const declaration = path.node.declaration;

                const expr = t.classExpression(declaration.id, null, declaration.body);
                const ae = t.assignmentExpression('=', left, expr);
                path.replaceWith(ae);
            },
        },
    };
}
