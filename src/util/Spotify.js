const redirectUri = 'http://localhost:3000/';
let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        // check for access token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            // This clears the parameters, allowing us to grab a new access token when it expires.
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
            { headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        });
    },



    async savePlaylist(name, trackUris) {
        console.log("name  " + name) 
        if (!name || !trackUris.length) {
            return;
        }

        const accessToken = await Spotify.getAccessToken();

        const headers = { Authorization: `Bearer ${accessToken}`,  'Content-Type': 'application/json',};

        const me = await fetch('https://api.spotify.com/v1/me', { headers: headers }).then(response => {
            return response.json();
        })

        const playlist = await fetch(`https://api.spotify.com/v1/users/${me.id}/playlists`,
            {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({'name': name})
            }).then(response => response.json())
                .then(result => {
                    console.log(result) 
                    return result
                })
        
            console.log(playlist)
        return await fetch(`https://api.spotify.com/v1/users/${me.id}/playlists/${playlist.id}/tracks`,{
            headers: headers,
            method: 'POST',
            body: JSON.stringify({uris: trackUris})
        }).then(result => {
            console.log(result)
        }).catch( ex => {
            console.warn(ex)
        }).finally( x => {
            console.log("i'm done, object:  ");
        })
    }
}

export default Spotify;
