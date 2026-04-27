import { createEffect, createSignal, For, on } from "solid-js";
import { emptyString } from "../library.jsx";

const topmostUrl = `${import.meta.env.VITE_API_BASE_URL}/topmost`;
const sortOptions = ["Day", "Week", "Month", "Year", "All"];

export default props => {
	const [sortBy, setSortBy] = createSignal(sortOptions[0]);
	const [lastPostId, setLastPostId] = createSignal();
	const [lastScore, setLastScore] = createSignal();
	const fetchTopmost = () => {};
	createEffect(
		on(sortBy, value => {
			document.querySelector(`input[name="sort-option"][value="${value}"]`)?.dispatchEvent(new MouseEvent("click"));
		})
	);
	return (
		<>
			<div class="row">
				<div class="btn-group d-none d-sm-flex w-100" role="group" aria-label="Sort top posts by">
					<For each={sortOptions}>
						{(option, index) => {
							const itemId = `sort-option-${index() + 1}`;
							return (
								<>
									<input id={itemId} type="radio" class="btn-check" name="sort-option" value={option} onInput={() => setSortBy(option)}/>
									<label class="btn btn-outline-primary" for={itemId}>{option}</label>
								</>
							);
						}}
					</For>
				</div>
				<div class="dropdown d-block d-sm-none">
					<button class="btn btn-secondary dropdown-toggle w-100" innerHTML={sortBy()} data-bs-toggle="dropdown" aria-expanded="false"></button>
					<ul class="dropdown-menu">
						<For each={sortOptions}>
							{(option, index) => (
								<li>
									<a class="dropdown-item" onClick={() => setSortBy(option)} role="button">{option}</a>
								</li>
							)}
						</For>
					</ul>
				</div>
			</div>
		</>
	);
};