import type { DiffLine, EvidenceEvent } from "../types.js";

function computeWordDiff(before: string, after: string): DiffLine[] {
	const beforeWords = before.split(/(\s+)/);
	const afterWords = after.split(/(\s+)/);
	const result: DiffLine[] = [];

	let bi = 0;
	let ai = 0;

	while (bi < beforeWords.length || ai < afterWords.length) {
		if (bi >= beforeWords.length) {
			result.push({
				type: "added",
				content: afterWords.slice(ai).join(""),
				lineNumber: 0,
			});
			break;
		}
		if (ai >= afterWords.length) {
			result.push({
				type: "removed",
				content: beforeWords.slice(bi).join(""),
				lineNumber: 0,
			});
			break;
		}

		if (beforeWords[bi] === afterWords[ai]) {
			let chunk = "";
			while (
				bi < beforeWords.length &&
				ai < afterWords.length &&
				beforeWords[bi] === afterWords[ai]
			) {
				chunk += beforeWords[bi];
				bi++;
				ai++;
			}
			if (chunk)
				result.push({ type: "unchanged", content: chunk, lineNumber: 0 });
		} else {
			const bStart = bi;
			const aStart = ai;

			while (
				bi < beforeWords.length &&
				(ai >= afterWords.length || beforeWords[bi] !== afterWords[ai])
			) {
				bi++;
			}

			if (
				ai < afterWords.length &&
				bi < beforeWords.length &&
				beforeWords[bi] === afterWords[ai]
			) {
				const removed = beforeWords.slice(bStart, bi).join("");
				const added = afterWords.slice(aStart, ai).join("");
				if (removed)
					result.push({ type: "removed", content: removed, lineNumber: 0 });
				if (added)
					result.push({ type: "added", content: added, lineNumber: 0 });
			} else {
				const removed = beforeWords.slice(bStart).join("");
				const added = afterWords.slice(aStart).join("");
				if (removed)
					result.push({ type: "removed", content: removed, lineNumber: 0 });
				if (added)
					result.push({ type: "added", content: added, lineNumber: 0 });
				break;
			}
		}
	}

	return result.length > 0
		? result
		: [{ type: "unchanged", content: after || before, lineNumber: 0 }];
}

export class DiffView {
	private container: HTMLElement;
	private event: EvidenceEvent | null = null;

	constructor(container: HTMLElement) {
		this.container = container;
		this.renderEmpty();
	}

	showDiff(event: EvidenceEvent): void {
		this.event = event;
		this.render();
	}

	clear(): void {
		this.event = null;
		this.renderEmpty();
	}

	private renderEmpty(): void {
		this.container.innerHTML = "";
		const title = document.createElement("div");
		title.className = "panel-title";
		title.textContent = "Diff Viewer";
		this.container.appendChild(title);

		const hint = document.createElement("div");
		hint.style.cssText =
			"color:var(--text-dim);font-size:0.85rem;padding:1rem 0;";
		hint.textContent = "Click an event in the timeline to see the diff.";
		this.container.appendChild(hint);
	}

	private render(): void {
		if (!this.event) {
			this.renderEmpty();
			return;
		}

		const event = this.event;
		this.container.innerHTML = "";

		const title = document.createElement("div");
		title.className = "panel-title";
		title.textContent = `Diff · r${event.fromRevisionId} → r${event.toRevisionId}`;
		this.container.appendChild(title);

		const sectionInfo = document.createElement("div");
		sectionInfo.style.cssText =
			"font-size:0.78rem;color:var(--text-dim);margin-bottom:0.5rem;font-family:var(--font-mono);";
		sectionInfo.textContent = event.section || "(no section)";
		this.container.appendChild(sectionInfo);

		const diffLines = computeWordDiff(event.before, event.after);

		const diffContainer = document.createElement("div");
		diffContainer.className = "diff-container";

		for (const line of diffLines) {
			const el = document.createElement("span");
			el.style.cssText =
				"font-family:var(--font-mono);font-size:0.85rem;line-height:1.7;";
			if (line.type === "added") {
				el.className = "diff-word-added";
				el.style.cssText +=
					"background:var(--green-soft);color:var(--green);padding:0.1rem 0;border-radius:2px;";
			} else if (line.type === "removed") {
				el.className = "diff-word-removed";
				el.style.cssText +=
					"background:var(--red-soft);color:var(--red);text-decoration:line-through;padding:0.1rem 0;border-radius:2px;";
			}
			el.textContent = line.content;
			diffContainer.appendChild(el);
		}

		const labels = document.createElement("div");
		labels.style.cssText =
			"display:flex;gap:1rem;margin-top:0.75rem;font-size:0.75rem;color:var(--text-dim);";
		labels.innerHTML =
			'<span style="color:var(--red)">⬤ Removed</span><span style="color:var(--green)">⬤ Added</span>';
		diffContainer.appendChild(labels);

		this.container.appendChild(diffContainer);
	}
}
