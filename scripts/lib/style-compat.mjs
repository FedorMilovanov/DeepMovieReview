import postcss from "postcss";

/** A vendor twin must belong to the same declaration block and use the same
 * value. Before/after order is irrelevant; a neighbouring selector is not proof. */
export function hasUnprefixedDeclaration(css, property) {
  let missing = false;
  postcss.parse(css).walkDecls(property, (declaration) => {
    const twin = declaration.parent.nodes.some((node) =>
      node.type === "decl" && node.prop === `-webkit-${property}` &&
      node.value === declaration.value && node.important === declaration.important,
    );
    if (!twin) missing = true;
  });
  return missing;
}
