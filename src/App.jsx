import Editor from "./components/Editor";
import DisplayPost from "./components/DisplayPost";
import DisplayPostList from "./components/DisplayPostList";
import { quipStore } from "./store/quip-store";
import { For, Show } from "solid-js";

function App() {
	return (
		<>
			<div class="row">
				<div class="col px-5 py-3">
					<Editor id="post-editor" classList={{ "mb-2": true }}/>
					<ul class="list-group">
						<DisplayPostList posts={quipStore.quips}/>
					</ul>
				</div>
			</div>
		</>
	);
}

export default App;