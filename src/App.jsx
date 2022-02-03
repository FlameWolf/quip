import Editor from "./components/Editor";
import DisplayPost from "./components/DisplayPost";
import { quipStore } from "./store/quip-store";

function App() {
	return (
		<>
			<div class="row">
				<div class="col px-5 py-3">
					<Editor id="post-editor" classList={{ "mb-2": true }}/>
					<ul class="list-group">
						<For each={quipStore.quips}>
						{
							(quip, index) => <DisplayPost post={quip}/>
						}
						</For>
					</ul>
				</div>
			</div>
		</>
	);
}

export default App;