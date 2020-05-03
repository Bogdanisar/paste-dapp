



export function convertUnixEpochToDate(unixEpoch) {
    return new Date(unixEpoch * 1000);
}

export function dateToString(date) {
    let ret = "";
    ret += date.toLocaleTimeString();
    ret += " ";
    ret += date.toLocaleDateString();

    return ret;
}

export function convertUnixEpochToString(unixEpoch) {
    let date = convertUnixEpochToDate(unixEpoch);
    return dateToString(date);
}
