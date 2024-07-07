import { bench, group, run } from "mitata";

// group("Boolean", () => {
// 	bench("Constructor", () => Boolean(1));
// 	bench("Not Not", () => !!1);
// });

group("Split vs Match", () => {
	const str = "aaa\n".repeat(10000);
	bench("split", () => {
		return str.split(/\n/g).length;
	});

	bench("match", () => {
		return str.match(/\n/g)?.length ?? 0;
	});
});

run();
