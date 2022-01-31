auto a = [ ];
auto b = [ ];

auto test( auto x, auto  y, auto  z) {
  x.length = 0, x[0] = "hello";  // modifies the array that `x` would reference
  y = [ "hello" ];               // modifies `y` instead of the argument
}
test(a, b);  // arguments are in effect pointers

console.log("a = ", a);   // [ 'hello' ]
console.log("b = ", b);   // []