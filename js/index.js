const bio = document.getElementById("bio");
const fullName = document.getElementById("name");
const blog = document.getElementById("blog");
const userLocation = document.getElementById("location");
const faveLang = document.getElementById("fave-lang");
const avatar = document.getElementById("avatar");
const username = document.getElementById("username");
const btn = document.getElementById("btn");
const message = document.getElementById("feedback-msg");
const formText = document.getElementById("form-feedback");
const upperInfoDiv = document.querySelector(".info-upper");
const infoDiv = document.querySelector(".info-container");

let state = "Waiting for input"; //if set to loaded, will display user's info otherwise the message
update(state);

// onclick event for submit button
btn.onclick = (e) => {
	e.preventDefault();
	state = "Loading...";
	update(state);
	getUserInfo(username.value);
};

// get user info from github/cache. then update state.
async function getUserInfo(username) {
	const key = `user-${username}`;

	if (localStorage.getItem(key) != null) {
		readFromLs(key);
		formText.innerText = "Read from cache.";
		state = "loaded";
		update(state);
		return;
	}

	formText.innerText = "Fetching from github...";
	url = `https://api.github.com/users/${username}`;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.log(response.status);
			if (response.status === 404) throw new Error("404");
		} else {
			const data = await response.json();
			state = "loaded";
			update(state);
			saveInLS(data, key);
			readFromLs(key);
		}
	} catch (e) {
		if (e.message === "404") state = "User not found.";
		else state = "Network error.";
	}
	update(state);
}

// save given data in localstorage data with key
function saveInLS(data, key) {
	window.localStorage.setItem(key, JSON.stringify(data));
}

// read and apply user's data from localstorage by given key.
function readFromLs(key) {
	data = JSON.parse(window.localStorage.getItem(key));

	fullName.innerHTML = data.name;
	blog.innerHTML = data.blog;
	userLocation.innerHTML = data.location;
	fullName.innerHTML = data.name;
	avatar.src = data.avatar_url;
	bio.innerHTML = data.bio ? data.bio.replaceAll("\r\n", "<br>") : null;
}

// update elements visibility and styles based on the given state.
function update(state) {
	if (state === "loaded") {
		upperInfoDiv.style.display = "flex";
		bio.style.display = "block";
		message.style.display = "none";
		infoDiv.style.justifyContent = "space-between";
		return;
	}

	upperInfoDiv.style.display = "none";
	bio.style.display = "none";
	message.style.display = "block";
	infoDiv.style.justifyContent = "center";
	message.innerHTML = state;
}
