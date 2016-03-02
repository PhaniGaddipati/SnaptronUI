/**
 * Created by Phani on 3/1/2016.
 */

numberWithCommas = function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};