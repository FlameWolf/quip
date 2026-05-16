declare global {
	interface Event {
		native: any;
	}
}

export interface Author {
	_id: string;
	handle: string;
}

export interface MediaFile {
	src: string;
	fileType: "image" | "video";
	description?: string;
}

export type PollVotes = {
	first?: number;
	second?: number;
	third?: number;
	fourth?: number;
} & Record<string, number | undefined>;

export interface Poll {
	first: string;
	second: string;
	third?: string;
	fourth?: string;
	votes: PollVotes;
	expired?: boolean;
	duration?: number;
}

export interface Attachments {
	poll?: Poll;
	mediaFile?: MediaFile;
	post?: string | Post;
}

export interface Post {
	_id: string;
	content: string;
	author: Author;
	createdAt: string;
	attachments?: Attachments;
	favourited?: boolean;
	repeated?: boolean;
	repeatedBy?: Author;
	replyTo?: string;
	voted?: string;
	__v: number;
}

export interface User extends Author {
	self?: boolean;
	followedByMe?: boolean;
	followedMe?: boolean;
	mutedByMe?: boolean;
	mutedReason?: string;
	blockedByMe?: boolean;
	blockedMe?: boolean;
	blockedReason?: string;
	requestedToFollowByMe?: boolean;
	requestedToFollowMe?: boolean;
	following?: number;
	followers?: number;
	postsCount?: number;
	protected?: boolean;
	deactivated?: boolean;
}

export interface Favourite {
	_id: string;
	post: Post;
	favouritedBy: User;
}

export interface Bookmark {
	_id: string;
	post: Post;
	bookmarkedBy: User;
}

export interface AuthState {
	userId: string | undefined;
	handle: string | undefined;
	token: string | undefined;
	createdAt: string | undefined;
	expiresIn: string | undefined;
	refreshToken?: string | undefined;
}

export interface ThemeState {
	theme: string;
	readonly isLight: boolean;
	readonly isDark: boolean;
}

export interface ErrorState {
	message: string | undefined;
}

export interface QuipState {
	quips: Post[];
	nextId: number;
}

export type LinkType = "url" | "mention" | "hashtag";

export type BroadcastMessage = Partial<AuthState>;

export interface CookieOptions {
	path?: string;
	domain?: string;
	maxAge?: number;
	expires?: string;
	secure?: boolean;
	sameSite?: "strict" | "lax" | "none";
}