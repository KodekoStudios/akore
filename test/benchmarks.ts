import { bench, group, run } from "mitata";
import _ from "lodash";

// group("uniq vs set", () => {
//     bench("uniq", () => { // x1.63 faster
//         const x = _.uniq([1, 2, 3, 4, 5, 5, 6, 7, 8, 2, 6]);
//         return `(${x.join(" | ")})[]`;
//     })

//     bench("set", () => {
//         const x = new Set([1, 2, 3, 4, 5, 5, 6, 7, 8, 2, 6]);
//         return `(${[...x].join(" | ")})[]`;
//     })
// })

// group("check empty", () => {
//     const e = ["Im not empty!"];
//     const r = [/* I am */];

//     bench("m1", () => {
//         e.length === 0;
//         r.length === 0;
//     });
//     bench("m2", () => {
//         _.isEmpty(e);
//         _.isEmpty(r);
//     });
//     bench("m3", () => {
//         _.eq(e, []);
//         _.eq(r, []);
//     });
//     bench("m4", () => {
//         e.every(() => false);
//         r.every(() => false);
//     });
//     bench("m5", () => {
//         e.some(() => true);
//         r.some(() => true);
//     });
//     bench("m6", () => { // better than the others
//         e[0] === undefined;
//         r[0] === undefined;
//     });
//     bench("m7", () => {
//         !e.length;
//         !r.length;
//     });
// })

// group("Boolean", () => {
// 	bench("Constructor", () => Boolean(1));
// 	bench("Not Not", () => !!1); // x1.35 faster
// });

// group("Split vs Match", () => {
// 	const str = "aaa\n".repeat(10000);
// 	bench("split", () => str.split(/\n/g).length);
// 	bench("match", () => str.match(/\n/g)?.length ?? 0); // x1.68 faster
// });

// group("Map", () => { 
// 	const map = new Map([[1, 2], [3, 4], [5, 6], [7, 8]])
// 	bench("Array.from", () => Array.from(map.values()));
// 	bench("spread", () => [...map.values()]);
// 	bench("forEach", () => { // x1.76 n 2.25 faster
// 		const result: number[] = [];
// 		for (const value of map.values()) result.push(value)
// 		return result;
// 	})
// })

run();
