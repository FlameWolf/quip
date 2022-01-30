import Editor from "./components/Editor";
import DisplayPost from "./components/DisplayPost";

function App() {
	return (
		<>
			<div class="row">
				<div class="col px-5 py-3">
					<Editor id="post-editor" classList={{ "mb-2": true }}/>
					<ul class="list-group">
						<li class="list-group-item">Item 1</li>
						<li class="list-group-item">Item 2</li>
						<DisplayPost text="This is some card text."/>
						<DisplayPost text="This is some other card text."/>
						<li class="list-group-item">Item 5</li>
					</ul>
				</div>
			</div>
		</>
	);
}

export default App;