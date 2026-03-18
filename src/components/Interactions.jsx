import { useParams } from "@solidjs/router";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import { BsPersonBadgeFill } from "solid-icons/bs";
import { authStore } from "../stores/auth-store";
import { emptyString, maxItemsToFetch } from "../library";
import { Dropdown } from "bootstrap";
import DisplayPostList from "./DisplayPostList";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;
const favouritesUrl = `${profileBaseUrl}/favourites`;
const votesUrl = `${profileBaseUrl}/votes`;
const bookmarksUrl = `${profileBaseUrl}/bookmarks`;
const mentionsUrl = `${profileBaseUrl}/mentions`;

export default props => {
	const pathToUse = location.pathname.split("/")?.[2];
	return <></>;
};