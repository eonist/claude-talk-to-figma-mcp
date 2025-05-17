/**
 * Child insertion operations for Figma nodes.
 * Exports: insertChild, insertChildren
 */

/**
 * Inserts a child node into a parent node at an optional index position.
 * @async
 * @function insertChild
 */
export async function insertChild(params) {
  const { parentId, childId, index } = params || {};
  if (!parentId) throw new Error("Missing parentId parameter");
  if (!childId) throw new Error("Missing childId parameter");
  try {
    const parent = await figma.getNodeByIdAsync(parentId);
    if (!parent) throw new Error(`Parent node not found with ID: ${parentId}`);
    const child = await figma.getNodeByIdAsync(childId);
    if (!child) throw new Error(`Child node not found with ID: ${childId}`);
    if (!("appendChild" in parent)) throw new Error(`Parent node with ID ${parentId} cannot have children`);
    const originalParent = child.parent;
    if (index !== undefined && index >= 0 && index <= parent.children.length) {
      parent.insertChild(index, child);
    } else {
      parent.appendChild(child);
    }
    const newIndex = parent.children.indexOf(child);
    return {
      parentId: parent.id,
      childId: child.id,
      index: newIndex,
      success: newIndex !== -1,
      previousParentId: originalParent ? originalParent.id : null
    };
  } catch (error) {
    throw new Error(`Error inserting child: ${error.message}`);
  }
}

/**
 * Batch-inserts multiple child nodes into parent nodes.
 * @async
 * @function insertChildren
 */
export async function insertChildren(params) {
  const { operations, options } = params || {};
  if (!operations || !Array.isArray(operations) || operations.length === 0) {
    throw new Error("Must provide an array of operations for insertChildren");
  }
  const results = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    try {
      let originalPosition = null;
      if (op.maintainPosition) {
        const child = await figma.getNodeByIdAsync(op.childId);
        if (child) {
          originalPosition = { x: child.x, y: child.y };
        }
      }
      const result = await insertChild(op);
      if (op.maintainPosition && originalPosition) {
        const parent = await figma.getNodeByIdAsync(op.parentId);
        const child = await figma.getNodeByIdAsync(op.childId);
        if (parent && child) {
          child.x = originalPosition.x - parent.x;
          child.y = originalPosition.y - parent.y;
        }
      }
      results.push({
        parentId: op.parentId,
        childId: op.childId,
        index: result.index,
        success: result.success,
        error: null
      });
    } catch (error) {
      if (options && options.skipErrors) {
        results.push({
          parentId: op.parentId,
          childId: op.childId,
          index: op.index,
          success: false,
          error: error.message || String(error)
        });
        continue;
      }
      throw error;
    }
  }
  return { results };
}
