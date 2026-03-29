/**
 * Rehype plugin that enhances decision records and WIP documents.
 *
 * Decision records:
 *   - Wraps each option block (h3 + following content) inside "What we considered" into .option-card divs
 *   - Marks the chosen option (h3 containing "✓" or "(chosen)") with .chosen class
 *   - Wraps the content after "## Outcome" in an .outcome-callout div
 *
 * WIP documents:
 *   - Replaces <code>[solid]</code> / <code>[testing]</code> with styled chips
 *   - Wraps the "Open questions" section content in .open-questions
 *   - Wraps the "Changelog" section in .wip-changelog with .changelog-entry rows
 */

/** @param {import('hast').Root} tree */
export function rehypeWritingTransform() {
  return (tree) => {
    const children = tree.children;

    // Detect document type by scanning for markers
    const isDecision = children.some(
      (n) => n.type === 'element' && n.tagName === 'h3' &&
        textContent(n).match(/✓|\(chosen\)/i)
    );
    const isWip = children.some(
      (n) => n.type === 'element' && containsChip(n)
    );

    if (isDecision) transformDecision(tree);
    if (isWip) transformWip(tree);
  };
}

// ─── Decision record transformations ────────────────────────────────────────

function transformDecision(tree) {
  wrapOptionCards(tree);
  wrapOutcomeCallout(tree);
}

function wrapOptionCards(tree) {
  const children = tree.children;
  const consideredIdx = children.findIndex(
    (n) => n.type === 'element' && n.tagName === 'h2' &&
      textContent(n).toLowerCase().includes('what we considered')
  );
  if (consideredIdx === -1) return;

  // Find the next h2 after the "What we considered" heading
  let sectionEnd = children.length;
  for (let i = consideredIdx + 1; i < children.length; i++) {
    if (children[i].type === 'element' && children[i].tagName === 'h2') {
      sectionEnd = i;
      break;
    }
  }

  // Collect nodes between the h2 and the next section
  const sectionNodes = children.slice(consideredIdx + 1, sectionEnd);

  // Split into option blocks (each starting with h3)
  const optionBlocks = [];
  let current = null;
  for (const node of sectionNodes) {
    if (node.type === 'element' && node.tagName === 'h3') {
      if (current) optionBlocks.push(current);
      current = { heading: node, body: [] };
    } else if (current) {
      current.body.push(node);
    }
  }
  if (current) optionBlocks.push(current);

  if (optionBlocks.length === 0) return;

  // Build card nodes
  const cardNodes = optionBlocks.map(({ heading, body }) => {
    const headingText = textContent(heading);
    const isChosen = /✓|\(chosen\)/i.test(headingText);

    // Clean up the heading text (remove the ✓ (chosen) marker)
    if (isChosen) {
      cleanHeadingMarker(heading);
    }

    const label = {
      type: 'element',
      tagName: 'span',
      properties: { className: ['option-label', isChosen ? 'chosen' : 'rejected'] },
      children: [{ type: 'text', value: isChosen ? 'Chosen' : 'Rejected' }],
    };

    return {
      type: 'element',
      tagName: 'div',
      properties: { className: ['option-card', ...(isChosen ? ['chosen'] : [])] },
      children: [label, heading, ...body],
    };
  });

  const wrapper = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['options-section'] },
    children: cardNodes,
  };

  // Replace the option nodes with the wrapper
  children.splice(consideredIdx + 1, sectionEnd - consideredIdx - 1, wrapper);
}

function cleanHeadingMarker(heading) {
  // Walk text nodes and remove ✓ (chosen) markers
  walkTextNodes(heading, (node) => {
    node.value = node.value.replace(/\s*✓\s*\(chosen\)/i, '').replace(/✓/g, '').trim();
  });
}

function wrapOutcomeCallout(tree) {
  const children = tree.children;
  const outcomeIdx = children.findIndex(
    (n) => n.type === 'element' && n.tagName === 'h2' &&
      textContent(n).toLowerCase() === 'outcome'
  );
  if (outcomeIdx === -1) return;

  // Gather everything after the h2 to the end
  const contentNodes = children.slice(outcomeIdx + 1);
  if (contentNodes.length === 0) return;

  // Detect status from the outcome-callout color (we can't know here, so use default)
  // We'll rely on the CSS class set by the template; add a generic callout class
  const callout = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['outcome-callout', 'positive'] },
    children: contentNodes,
  };

  children.splice(outcomeIdx + 1, contentNodes.length, callout);
}

// ─── WIP transformations ─────────────────────────────────────────────────────

function transformWip(tree) {
  transformChips(tree);
  wrapOpenQuestions(tree);
  wrapChangelog(tree);
}

function containsChip(node) {
  if (!node.children) return false;
  for (const child of node.children) {
    if (child.type === 'element' && child.tagName === 'code') {
      const t = textContent(child);
      if (t === '[solid]' || t === '[testing]') return true;
    }
    if (containsChip(child)) return true;
  }
  return false;
}

function transformChips(tree) {
  visitAll(tree, (node, index, parent) => {
    if (
      node.type === 'element' &&
      node.tagName === 'code' &&
      parent
    ) {
      const t = textContent(node);
      if (t === '[solid]' || t === '[testing]') {
        const chipClass = t === '[solid]' ? 'chip-solid' : 'chip-testing';
        const label = t === '[solid]' ? 'solid' : 'testing';
        const chip = {
          type: 'element',
          tagName: 'span',
          properties: { className: ['observation-chip', chipClass] },
          children: [{ type: 'text', value: label }],
        };
        parent.children.splice(index, 1, chip);
        return index; // revisit same index
      }
    }
  });
}

function wrapOpenQuestions(tree) {
  const children = tree.children;
  const oqIdx = children.findIndex(
    (n) => n.type === 'element' && n.tagName === 'h2' &&
      textContent(n).toLowerCase().includes('open questions')
  );
  if (oqIdx === -1) return;

  let sectionEnd = children.length;
  for (let i = oqIdx + 1; i < children.length; i++) {
    if (children[i].type === 'element' && children[i].tagName === 'h2') {
      sectionEnd = i;
      break;
    }
  }

  const contentNodes = children.slice(oqIdx + 1, sectionEnd);
  if (contentNodes.length === 0) return;

  const wrapper = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['open-questions'] },
    children: contentNodes,
  };

  children.splice(oqIdx + 1, sectionEnd - oqIdx - 1, wrapper);
}

function wrapChangelog(tree) {
  const children = tree.children;
  const clIdx = children.findIndex(
    (n) => n.type === 'element' && n.tagName === 'h2' &&
      textContent(n).toLowerCase().includes('changelog')
  );
  if (clIdx === -1) return;

  const contentNodes = children.slice(clIdx + 1);
  if (contentNodes.length === 0) return;

  // Transform each <li> in the changelog list into a .changelog-entry grid row
  // Convert the <ul> to a <div> to keep valid HTML (divs aren't valid inside ul)
  for (const node of contentNodes) {
    if (node.type === 'element' && node.tagName === 'ul') {
      node.tagName = 'div';
      node.children = node.children
        .filter((li) => li.type === 'element' && li.tagName === 'li')
        .map((li) => {
          // Each li has children like: [strong(date), text(" — rest of text")]
          // Extract date from the first strong element
          const dateNode = li.children.find(
            (c) => c.type === 'element' && c.tagName === 'strong'
          );
          const dateText = dateNode ? textContent(dateNode) : '';

          // Get remaining text after the date strong tag
          let restNodes = [];
          let seenDate = false;
          for (const c of li.children) {
            if (!seenDate && c.type === 'element' && c.tagName === 'strong') {
              seenDate = true;
              continue;
            }
            if (seenDate) restNodes.push(c);
          }

          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['changelog-entry'] },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: { className: ['changelog-date'] },
                children: [{ type: 'text', value: dateText }],
              },
              {
                type: 'element',
                tagName: 'span',
                properties: {},
                children: restNodes,
              },
            ],
          };
        });
    }
  }

  const wrapper = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['wip-changelog'] },
    children: [
      {
        type: 'element',
        tagName: 'h2',
        properties: {},
        children: [{ type: 'text', value: 'Changelog' }],
      },
      ...contentNodes,
    ],
  };

  // Replace the h2 and its content with the styled wrapper
  children.splice(clIdx, 1 + contentNodes.length, wrapper);
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function textContent(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (!node.children) return '';
  return node.children.map(textContent).join('');
}

function walkTextNodes(node, fn) {
  if (node.type === 'text') { fn(node); return; }
  if (node.children) node.children.forEach((c) => walkTextNodes(c, fn));
}

/** Depth-first visit with parent/index tracking. Callback can return new index to adjust iteration. */
function visitAll(tree, fn) {
  function walk(node, parent, index) {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const result = fn(node.children[i], i, node);
        if (typeof result === 'number') { i = result - 1; continue; }
        walk(node.children[i], node, i);
      }
    }
  }
  walk(tree, null, 0);
}
