import type { JSX } from "solid-js";
import type { Post } from "./index";

export interface EditorProps extends JSX.HTMLAttributes<HTMLDivElement> {
	parentPostId?: string;
	isQuote?: boolean;
	quotedPost?: Post;
	isEditing?: boolean;
	post?: Post;
	isReply?: boolean;
	onSubmit?: (event?: Event) => void;
}