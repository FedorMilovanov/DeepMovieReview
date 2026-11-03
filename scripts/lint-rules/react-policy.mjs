// Narrow replacements for checks in eslint-plugin-react's recommended config
// that are not covered by oxlint's native React rules. The legacy API list is
// based on eslint-plugin-react 7.37.5, MIT license, jsx-eslint contributors.
const reactMethods = [
  "renderComponent", "renderComponentToString", "renderComponentToStaticMarkup", "isValidComponent", "isValidClass",
  "render", "unmountComponentAtNode", "findDOMNode", "renderToString", "renderToStaticMarkup", "createClass", "PropTypes", "DOM",
];
const reactNested = ["PropTypes.component", "PropTypes.renderable", "addons.classSet", "addons.cloneWithProps", "addons.LinkedStateMixin", "addons.TestUtils"];
const domMethods = ["render", "hydrate", "unmountComponentAtNode"];
const serverMethods = ["renderToNodeStream"];
const perfMethods = ["printDOM", "getMeasurementsSummaryMap"];
const moduleNames = new Map([
  ["react", "React"],
  ["react-dom", "ReactDOM"],
  ["react-dom/server", "ReactDOMServer"],
  ["react-addons-perf", "ReactPerf"],
]);
function pragmaFor(context) {
  for (const comment of context.sourceCode.getAllComments()) {
    const match = /@jsx\s+([^\s]+)/.exec(comment.value);
    if (match) {
      const name = match[1].split(".")[0];
      return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(name) ? name : "React";
    }
  }
  const name = context.settings.react?.pragma || "React";
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(name) ? name : "React";
}
function deprecatedNames(pragma) {
  return new Set([
    ...reactMethods.map(name => `${pragma}.${name}`),
    ...reactNested.map(name => `${pragma}.${name}`),
    ...domMethods.map(name => `ReactDOM.${name}`),
    ...serverMethods.map(name => `ReactDOMServer.${name}`),
    ...perfMethods.flatMap(name => [`ReactPerf.${name}`, `Perf.${name}`]),
    "this.transferPropsTo",
  ]);
}
// React is pinned to 19.x. Lifecycle deprecations are checked separately by
// oxlint's react/no-unsafe with checkAliases, including createReactClass.
const noDeprecated = {
  meta: {
    type: "problem",
    docs: { description: "Disallow React APIs deprecated in the pinned React version" },
    schema: [],
    messages: { deprecated: "{{api}} is a deprecated React API." },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const names = deprecatedNames(pragmaFor(context));
    function report(node, api) {
      if (names.has(api)) context.report({ node, messageId: "deprecated", data: { api } });
    }
    return {
      MemberExpression(node) { report(node, sourceCode.getText(node)); },
      ImportDeclaration(node) {
        const moduleName = moduleNames.get(node.source.value);
        if (!moduleName) return;
        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportSpecifier") report(specifier, `${moduleName}.${specifier.imported.name ?? specifier.imported.value}`);
        }
      },
      VariableDeclarator(node) {
        if (node.id.type !== "ObjectPattern" || !node.init) return;
        let moduleName;
        if (node.init.type === "Identifier") {
          moduleName = [...moduleNames.values()].includes(node.init.name) || node.init.name === "Perf" ? node.init.name : undefined;
        } else if (node.init.type === "CallExpression" && node.init.callee.type === "Identifier" && node.init.callee.name === "require") {
          moduleName = moduleNames.get(node.init.arguments[0]?.value);
        }
        if (!moduleName) return;
        for (const prop of node.id.properties) {
          if (prop.type === "Property" && !prop.computed) report(prop, `${moduleName}.${prop.key.name ?? prop.key.value}`);
        }
      },
    };
  },
};
// oxlint's display-name rule covers ordinary anonymous components, but misses
// a directly exported anonymous memo/forwardRef callback. Keep that case gated.
const noAnonymousDefaultMemo = {
  meta: {
    type: "problem",
    docs: { description: "Require display names on directly exported memo/forwardRef components" },
    schema: [],
    messages: { displayName: "Exported React component is missing a display name." },
  },
  create(context) {
    const pragma = pragmaFor(context);
    const named = new Set();
    for (const item of context.sourceCode.ast.body) {
      if (item.type !== "ImportDeclaration" || item.source.value !== "react") continue;
      for (const specifier of item.specifiers) {
        if (specifier.type === "ImportSpecifier" && ["memo", "forwardRef"].includes(specifier.imported.name ?? specifier.imported.value)) {
          named.add(specifier.local.name);
        }
      }
    }
    return {
      ExportDefaultDeclaration(node) {
        const call = node.declaration;
        if (call.type !== "CallExpression") return;
        const fn = call.arguments[0];
        if (!fn || !["ArrowFunctionExpression", "FunctionExpression"].includes(fn.type) || fn.id) return;
        const callee = call.callee;
        const name = context.sourceCode.getText(callee);
        if ([`${pragma}.memo`, `${pragma}.forwardRef`].includes(name) || (callee.type === "Identifier" && named.has(callee.name))) {
          context.report({ node: fn, messageId: "displayName" });
        }
      },
    };
  },
};
const reactPolicy = { rules: { "no-deprecated-react-api": noDeprecated, "no-anonymous-default-memo": noAnonymousDefaultMemo } };
export default reactPolicy;
