import { createEffect, For } from "solid-js";
import { quipStore } from "../store/quip-store";
import DisplayPost from "./DisplayPost";

export default props => {
	const postNodes = [];
	for(const post of props.posts) {
		postNodes.push(<DisplayPost post={post}/>);
	}
	return postNodes;
};