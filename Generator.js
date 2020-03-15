// cb 也就是编译过的 test 函数
function generator(cb) {
	return (function () {
		var object = {
			next: 0,
			stop: function () {}
		};

		return {
			next: function (data) {
				object.sent = data
				var ret = cb(object);
				if (ret === undefined) return {
					value: undefined,
					done: true
				};
				return {
					value: ret,
					done: false
				};
			}
		};
	})();
}
// 如果你使用 babel 编译后可以发现 test 函数变成了这样
function test() {
	var a;
	return generator(function (_context) {
		while (1) {
			switch ((_context.prev = _context.next)) {
				case 0:
					_context.next = 2;
					return 1;

				case 2:
					a = _context.sent;
					console.log(a);
					_context.next = 6;
					return 3;

				case 6:
				case "end":
					return _context.stop();
			}
		}
	});
}

let b = test()
console.log(b.next()); // >  { value: 2, done: false }
console.log(b.next(3)); // >  { value: 3, done: false }
console.log(b.next()); // >  { value: undefined, done: true }