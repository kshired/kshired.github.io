Date.prototype.yyyymmdd = function () {
	var mm = this.getMonth() + 1;
	var dd = this.getDate();

	return [this.getFullYear(),
		(mm > 9 ? '' : '0') + mm,
		(dd > 9 ? '' : '0') + dd
	].join('-');
};
$(function () {
	var date1 = new Date("2021-06-09");
	var date2 = new Date();
	date1.setHours(0, 0, 0, 0);
	date2.setHours(0, 0, 0, 0);
	$("#today > td").text(date2.yyyymmdd());
	var diff = (date1 - date2) / (864e+5);
	var per_diff = (562 - diff) / 562 * 100;
	per_diff = per_diff.toFixed(2).toString();
	$("#day").text((562-diff).toString()+"일 째 복무 중!");
	$("#bar").text(per_diff + "%");
	if (per_diff < 0) {
		$("#bar").text("0%");
	} else if (per_diff <= 10) {
		$("#bar").css("width", "10%");
	} else if (per_diff >= 100) {
		$("#bar").text("100%!");
		$("#bar").css("width", "100%");
	} else {
		$("#bar").css("width", per_diff + "%");
	}
});