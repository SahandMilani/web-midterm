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

			update(state);
			const repoFaveLang = await getLangs(data.repos_url);
			state = "loaded";
			saveInLS({ ...data, faveLang: repoFaveLang }, key);
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
	faveLang.innerHTML = data.faveLang
		? `Favorite lang: ${data.faveLang}`
		: null;
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

// get favourite language from recently pushed repos
async function getLangs(url) {
	const response = await fetch(url);
	let langs = {};
	if (response.ok) {
		const data = await response.json();

		// sort by pushed_at
		data.sort(function compareFn(a, b) {
			return new Date(b.pushed_at) - new Date(a.pushed_at);
		});
		const newRepos = data.slice(0, 5);
		for (let i = 0; i < newRepos.length; i++) {
			const repo = newRepos[i];
			const lang = repo.language;
			if (lang == null) continue;
			langs[lang] = langs[lang] == null ? 1 : (langs[lang] += 1);
		}
	}

	// sort langs
	let sortable = [];
	for (var lang in langs) {
		sortable.push([lang, langs[lang]]);
	}
	sortable.sort(function (a, b) {
		return b[1] - a[1];
	});
	if (sortable.length == 0) return null;
	return sortable[0][0];
}
