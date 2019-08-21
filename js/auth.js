window.MFAuth = window.MFAuth || (function() {
    //
    if (!getCookie('mym_not_authorized')
        && !getAllUrlParams(window.location.search).session_id
        && !getAllUrlParams(window.location.search).not_authorized) {
        if (!localStorage.getItem('mf-educ-state') || !JSON.parse(localStorage.getItem('mf-educ-state')).user.isAuthorized) {
            window.location = 'http://life.megafon.ru/auth_for_partners?return_url=' + encodeURIComponent(window.location.href);
        }
    }

    // если в get параметрах есть not_authorized=true
    if (getAllUrlParams(window.location.search).not_authorized) {
        resetLocalState();
        setCookie('mym_not_authorized')
    }

    // если в get параметрах есть session_id
    if (getAllUrlParams(window.location.search).session_id) {
        resetLocalState();
    }

    function logout() {
        resetLocalState();
        setCookie('mym_not_authorized');
    }

    // устанавливает cookie с именем name
    function setCookie(name) {
        const date = new Date(new Date().getTime() + 3600 * 1000);
        document.cookie = name + "=1; path=/; expires=" + date.toUTCString();
    }

    // возвращает cookie с именем name, если есть, если нет, то undefined
    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + "=([^;]*)"
        ));

        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    // возвращает get параметры извлекаемые из URL
    function getAllUrlParams(url) {
        var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
        var obj = {};

        if (queryString) {
            queryString = queryString.split('#')[0];
            var arr = queryString.split('&');

            for (var i = 0; i < arr.length; i++) {
                var a = arr[i].split('=');
                var paramNum = undefined;
                var paramName = a[0].replace(/\[\d*\]/, function(v) {
                    paramNum = v.slice(1, -1);
                    return '';
                });
                var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
                paramName = paramName.toLowerCase();
                paramValue = paramValue.toLowerCase();

                if (obj[paramName]) {
                    if (typeof obj[paramName] === 'string') {
                        obj[paramName] = [obj[paramName]];
                    }

                    if (typeof paramNum === 'undefined') {
                        obj[paramName].push(paramValue);
                    } else {
                        obj[paramName][paramNum] = paramValue;
                    }
                } else {
                    obj[paramName] = paramValue;
                }
            }
        }

        return obj;
    }

    // сбрасыввет данные авторизации
    function resetLocalState() {
        const state = JSON.parse(localStorage.getItem('mf-educ-state'));
        const user = { ...state.user, id: '', msisdn: '', accessToken: '', expiresIn: '', isAuthorized: false };

        localStorage.setItem('mf-educ-state', JSON.stringify({ ...state, user: user }));
    }

    function isValidAccessToken() {
        const stateUser = JSON.parse(localStorage.getItem('mf-educ-state')).user;
        const expiresIn = Number(stateUser.expiresIn);
        const now = Math.floor(new Date().getTime() / 1000);

        if (now > expiresIn) {
            return false
        }

        return true;
    }

    return {
        getCookie: getCookie,
        getAllUrlParams: getAllUrlParams,
        resetLocalState: resetLocalState,
        isValidAccessToken: isValidAccessToken,
        logout: logout
    };
})();