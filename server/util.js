
module.exports.extend = function extend(dest, src, over) {

    if (over === undefined) {
        over = true;
    }

    dest = dest || {};
    src  = src  || {};

    for (var key in src) {
        if (src.hasOwnProperty(key)) {
            if (over || !dest.hasOwnProperty(key)) {
                dest[key] = src[key];
            }
        }
    }

    return dest;
}
